import { customAlphabet } from "nanoid";
import * as Y from "yjs";

export function patchKeyValueArray(
  array: Y.Array<string[]>,
  patch: Record<string, string | null>
) {
    const lengthToDate = array.length
    const attributeNames = Object.keys(patch)

    const indexesToRemove: number[] = []
    for (let j = 0; j < lengthToDate; j++) {
      const attribute = array.get(j)
      if (attributeNames.includes(attribute[0])) {
        indexesToRemove.push(j)
      }
    }

    const groups = groupConsecutiveIndexes(indexesToRemove)
    groups.forEach(([start, length]) => {
        array.delete(start, length)
    })

    const newAttributePairs: Array<string[]> = []
    for (const [key, value] of Object.entries(patch)) {
        if(value === null) continue
        newAttributePairs.push([key, value])
    }

    array.push(newAttributePairs)
}

// assumes indexes is sorted already
export function groupConsecutiveIndexes(indexes: number[]): [number, number][] {
  if (indexes.length === 0) {
    return [];
  }

  const result: [number, number][] = [];
  let start = indexes[0];
  let length = 1;

  for (let i = 1; i < indexes.length; i++) {
    if (indexes[i] === indexes[i - 1] + 1) {
      // Consecutive index
      length++;
    } else {
      // Add the previous group to the result
      result.push([start, length]);

      // Start a new group
      start = indexes[i];
      length = 1;
    }
  }

  // Add the last group to the result
  result.push([start, length]);

  return result;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(2)} ${units[index]}`;
}

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * (max + 1));
}

const alphaNumericId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8
);

const alphaId = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8
);

export function generateId() {
  return `${alphaId(1)}${alphaNumericId(7)}`;
}
