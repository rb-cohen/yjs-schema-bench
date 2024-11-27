import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  generateId,
  formatBytes,
  groupConsecutiveIndexes,
  getRandomInt,
  patchKeyValueArray,
} from "./utils";

const NUMBER_OF_ELEMENTS = 100; // Set this to 100/1000 to see big differences in doc size
const NUMBER_OF_UPDATES = 100;

describe("replacing the attributes array to reduce doc size", () => {
  it("updates attributes a lot", () => {
    const start = performance.now();

    const doc = new Y.Doc();
    const elementMap =
      doc.getMap<Y.Map<string | Y.Array<string[]>>>("elementSchema");

    const ids = new Set<string>();

    for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
      const id = generateId();
      const element = new Y.Map<string | Y.Array<string[]>>();

      const attributes = new Y.Array<string[]>();
      attributes.push([
        ["width", "100"],
        ["height", "200"],
      ]);

      element.set("tagName", "div");
      element.set("attributes", attributes);

      elementMap.set(id, element);
      ids.add(id);
    }

    const endHydrate = performance.now();
    console.log("Hydrate time:", endHydrate - start);

    const update1v1 = Y.encodeStateAsUpdate(doc);
    const update1v2 = Y.encodeStateAsUpdateV2(doc);
    const json1V2 = JSON.stringify(doc.toJSON());
    console.log(
      "Insert doc size:",
      formatBytes(update1v1.byteLength),
      "(v1)",
      formatBytes(update1v2.byteLength),
      "(v2)",
      formatBytes(json1V2.length),
      "(json)"
    );

    const endEncode = performance.now();
    console.log("Encode time:", endEncode - endHydrate);

    // update the width and height of all elements, 1000 times
    for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
      ids.forEach((id) => {
        const elementAttributes = elementMap
          .get(id)!
          .get("attributes")! as Y.Array<string[]>;

        const lengthToDate = elementAttributes.length;

        const indexesToRemove: number[] = [];
        for (let j = 0; j < lengthToDate; j++) {
          const attribute = elementAttributes.get(j);
          if (attribute[0] === "width" || attribute[0] === "height") {
            indexesToRemove.push(j);
          }
        }

        const groups = groupConsecutiveIndexes(indexesToRemove);
        groups.forEach(([start, length]) => {
          elementAttributes.delete(start, length);
        });

        elementAttributes.push([
          ["width", getRandomInt(1000).toString()],
          ["height", getRandomInt(1000).toString()],
        ]);
      });
    }

    const endUpdate = performance.now();
    console.log("Update time:", endUpdate - endEncode);

    const update2v1 = Y.encodeStateAsUpdate(doc);
    const update2v2 = Y.encodeStateAsUpdateV2(doc);
    const json2V2 = JSON.stringify(doc.toJSON());
    console.log(
      "Updated doc size:",
      formatBytes(update2v1.byteLength),
      "(v1)",
      formatBytes(update2v2.byteLength),
      "(v2)",
      formatBytes(json2V2.length),
      "(json)"
    );

    const endEncode2 = performance.now();
    console.log("Encode time:", endEncode2 - endUpdate);

    // Push a new Y.Array representing the attributes to clear out per attribute update tombstones
    ids.forEach((id) => {
      const elementAttributes = elementMap
        .get(id)!
        .get("attributes")! as Y.Array<string[]>;

      const newArray = new Y.Array<string[]>();
      newArray.push(elementAttributes.toArray());
      elementMap.get(id)!.set("attributes", newArray);
    });

    const endCleanup = performance.now();
    console.log("Cleanup time:", endCleanup - endEncode2);

    const update3v1 = Y.encodeStateAsUpdate(doc);
    const update3v2 = Y.encodeStateAsUpdateV2(doc);
    const json3V2 = JSON.stringify(doc.toJSON());
    console.log(
      "Updated doc size with new array:",
      formatBytes(update3v1.byteLength),
      "(v1)",
      formatBytes(update3v2.byteLength),
      "(v2)",
      formatBytes(json3V2.length),
      "(json)"
    );

    // we should definitely see a reduction in doc size
    expect(update2v1.byteLength).toBeGreaterThan(update3v1.byteLength);

    // we can expect a reduction of at least 25% in doc size, this might change if YJS changes
    expect(update2v1.byteLength * 0.25).toBeGreaterThan(update3v1.byteLength);
  });

  it("still allows conflict free attribute updates after merging", () => {
    const doc = new Y.Doc();
    const elementMap =
      doc.getMap<Y.Map<string | Y.Array<string[]>>>("elementSchema");

    const id = generateId();
    const element = new Y.Map<string | Y.Array<string[]>>();

    const attributes = new Y.Array<string[]>();
    attributes.push([
      ["width", "100"],
      ["height", "200"],
    ]);

    element.set("tagName", "div");
    element.set("attributes", attributes);

    elementMap.set(id, element);

    // update the width and height of the element
    const elementAttributes = elementMap
    .get(id)!
    .get("attributes")! as Y.Array<string[]>;

    patchKeyValueArray(elementAttributes, { width: "200", height: "400" });

    const update2v1 = Y.encodeStateAsUpdate(doc);

    // Fork the doc
    const docFork = new Y.Doc();
    Y.applyUpdate(docFork, update2v1);

    // Push a new Y.Array representing the attributes to clear out per attribute update tombstones
    const newArray = new Y.Array<string[]>();
    newArray.push(elementAttributes.toArray());
    elementMap.get(id)!.set("attributes", newArray);

    // Add an attribute to the fork 
    const elementFork = docFork.getMap<Y.Map<string | Y.Array<string[]>>>("elementSchema").get(id)!;
    const elementAttributesFork = elementFork.get("attributes")! as Y.Array<string[]>;
    elementAttributesFork.push([["color", "red"]]);

    // Try to push the fork back to the original doc
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(docFork));
    // This should get the docs in sync
    Y.applyUpdate(docFork, Y.encodeStateAsUpdate(doc));

    console.log('original', JSON.stringify(doc.toJSON()));
    console.log('fork', JSON.stringify(docFork.toJSON()));

    // WARNING: Both docs should have the same attributes, but the color attribute gets lost
    expect(doc.getMap('elementSchema').get(id)!.get('attributes')!.toArray()).toEqual([ ['width', '200'], ['height', '400' ]]);
    expect(docFork.getMap('elementSchema').get(id)!.get('attributes')!.toArray()).toEqual([ ['width', '200'], ['height', '400']]);

    patchKeyValueArray(doc.getMap('elementSchema').get(id)!.get('attributes'), { position: 'absolute' });
    patchKeyValueArray(docFork.getMap('elementSchema').get(id)!.get('attributes'), { position: 'relative' });

    Y.applyUpdate(docFork, Y.encodeStateAsUpdate(doc));
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(docFork));

    // Both docs should have the same attributes now, but post update we will need to clean the array of duplicate position attributes
    const docAttributes = doc.getMap('elementSchema').get(id)!.get('attributes')!.toArray()
    const docForkAttributes = docFork.getMap('elementSchema').get(id)!.get('attributes')!.toArray()
    expect(docAttributes).toEqual(docForkAttributes);

    // We should have both position attributes in the array until we clean it
    expect(docAttributes).toContainEqual( ['position', 'relative'] );
    expect(docAttributes).toContainEqual( ['position', 'absolute'] );

    // Width and height should match
    expect(docAttributes).toContainEqual( ['width', '200'] );
    expect(docAttributes).toContainEqual( ['height', '400'] );
  });
});
