import { describe, it } from 'vitest'
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import { generateId, formatBytes, getRandomInt, patchKeyValueArray } from './utils'

const NUMBER_OF_ELEMENTS = 100 // Set this to 100/1000 to see big differences in doc size
const NUMBER_OF_UPDATES = 100

describe('schema benchmark', () => {
  console.log(
    `Applying ${NUMBER_OF_UPDATES} updates to ${NUMBER_OF_ELEMENTS} elements`,
  )

  describe('nested map', () => {
    it('updates attributes a lot', () => {
      const doc = new Y.Doc()
      const elementMap =
        doc.getMap<Y.Map<string | Y.Map<string>>>('elementSchema')

      const ids = new Set<string>()

      for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
        const id = generateId()
        const element = new Y.Map<string | Y.Map<string>>()
        const attributes = new Y.Map<string>()
        attributes.set('width', '100')
        attributes.set('height', '200')

        element.set('tagName', 'div')
        element.set('attributes', attributes)

        elementMap.set(id, element)
        ids.add(id)
      }

      const update1v1 = Y.encodeStateAsUpdate(doc)
      const update1v2 = Y.encodeStateAsUpdateV2(doc)
      const json1V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Insert doc size:',
        formatBytes(update1v1.byteLength),
        '(v1)',
        formatBytes(update1v2.byteLength),
        '(v2)',
        formatBytes(json1V2.length),
        '(json)',
      )

      // update the width and height of all elements, 1000 times
      for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
        ids.forEach((id) => {
          const elementAttributes = elementMap
            .get(id)!
            .get('attributes')! as Y.Map<string>
          elementAttributes.set('width', getRandomInt(1000).toString())
          elementAttributes.set('height', getRandomInt(1000).toString())
        })
      }

      const update2v1 = Y.encodeStateAsUpdate(doc)
      const update2v2 = Y.encodeStateAsUpdateV2(doc)
      const json2V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Updated doc size:',
        formatBytes(update2v1.byteLength),
        '(v1)',
        formatBytes(update2v2.byteLength),
        '(v2)',
        formatBytes(json2V2.length),
        '(json)',
      )
    })
  })

  describe('key value attribute map', () => {
    it('updates attributes a lot', () => {
      const doc = new Y.Doc()
      const elementMap = doc.getMap<Y.Map<string>>('elementSchema')

      const ids = new Set<string>()
      const attributeKeyValueMap = new Map<string, YKeyValue<string>>()

      for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
        const id = generateId()
        const element = new Y.Map<string>()

        element.set('tagName', 'div')
        elementMap.set(id, element)

        const attributesArray = doc.getArray<{ key: string; val: string }>(
          `${id}-attributes`,
        )
        const attributes = new YKeyValue<string>(attributesArray)
        attributes.set('width', '100')
        attributes.set('height', '200')

        ids.add(id)
        attributeKeyValueMap.set(id, attributes)
      }

      const update1v1 = Y.encodeStateAsUpdate(doc)
      const update1v2 = Y.encodeStateAsUpdateV2(doc)
      const json1V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Insert doc size:',
        formatBytes(update1v1.byteLength),
        '(v1)',
        formatBytes(update1v2.byteLength),
        '(v2)',
        formatBytes(json1V2.length),
      )

      // update the width and height of all elements, X times
      for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
        ids.forEach((id) => {
          const elementAttributes = attributeKeyValueMap.get(id)!
          elementAttributes.set('width', getRandomInt(1000).toString())
          elementAttributes.set('height', getRandomInt(1000).toString())
        })
      }

      const update2v1 = Y.encodeStateAsUpdate(doc)
      const update2v2 = Y.encodeStateAsUpdateV2(doc)
      const json2V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Updated doc size:',
        formatBytes(update2v1.byteLength),
        '(v1)',
        formatBytes(update2v2.byteLength),
        '(v2)',
        formatBytes(json2V2.length),
        '(json)',
      )
    })
  })

  describe('array as attribute value in map', () => {
    it('updates attributes a lot', () => {
      const doc = new Y.Doc()
      const elementMap =
        doc.getMap<Y.Map<string | Y.Array<string[]>>>('elementSchema')

      const ids = new Set<string>()

      for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
        const id = generateId()
        const element = new Y.Map<string | Y.Array<string[]>>()

        const attributes = new Y.Array<string[]>()
        attributes.push([
          ['width', '100'],
          ['height', '200'],
        ])

        element.set('tagName', 'div')
        element.set('attributes', attributes)

        elementMap.set(id, element)
        ids.add(id)
      }

      const update1v1 = Y.encodeStateAsUpdate(doc)
      const update1v2 = Y.encodeStateAsUpdateV2(doc)
      const json1V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Insert doc size:',
        formatBytes(update1v1.byteLength),
        '(v1)',
        formatBytes(update1v2.byteLength),
        '(v2)',
        formatBytes(json1V2.length),
        '(json)',
      )

      // update the width and height of all elements, 1000 times
      for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
        ids.forEach((id) => {
          const elementAttributes = elementMap
            .get(id)!
            .get('attributes')! as Y.Array<string[]>

          patchKeyValueArray(elementAttributes, {
            width: getRandomInt(1000).toString(),
            height: getRandomInt(1000).toString(),
          })
        })
      }

      const update2v1 = Y.encodeStateAsUpdate(doc)
      const update2v2 = Y.encodeStateAsUpdateV2(doc)
      const json2V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Updated doc size:',
        formatBytes(update2v1.byteLength),
        '(v1)',
        formatBytes(update2v2.byteLength),
        '(v2)',
        formatBytes(json2V2.length),
        '(json)',
      )
    })
  })

  describe('array as attribute value on root', () => {
    it('updates attributes a lot', () => {
      const doc = new Y.Doc()
      const elementMap = doc.getMap<Y.Map<string>>('elementSchema')

      const ids = new Set<string>()

      for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
        const id = generateId()
        const element = new Y.Map<string>()

        const attributes = doc.getArray<string[]>(`${id}-attr`)
        attributes.push([
          ['width', '100'],
          ['height', '200'],
        ])

        element.set('tagName', 'div')

        elementMap.set(id, element)
        ids.add(id)
      }

      const update1v1 = Y.encodeStateAsUpdate(doc)
      const update1v2 = Y.encodeStateAsUpdateV2(doc)
      const json1V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Insert doc size:',
        formatBytes(update1v1.byteLength),
        '(v1)',
        formatBytes(update1v2.byteLength),
        '(v2)',
        formatBytes(json1V2.length),
        '(json)',
      )

      // update the width and height of all elements, 1000 times
      for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
        ids.forEach((id) => {
          const elementAttributes = doc.getArray<string[]>(`${id}-attr`)
          patchKeyValueArray(elementAttributes, {
            width: getRandomInt(1000).toString(),
            height: getRandomInt(1000).toString(),
          })
        })
      }

      const update2v1 = Y.encodeStateAsUpdate(doc)
      const update2v2 = Y.encodeStateAsUpdateV2(doc)
      const json2V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Updated doc size:',
        formatBytes(update2v1.byteLength),
        '(v1)',
        formatBytes(update2v2.byteLength),
        '(v2)',
        formatBytes(json2V2.length),
        '(json)',
      )
    })
  })

  describe('using YXmlElement nested', () => {
    it('updates attributes a lot', () => {
      const doc = new Y.Doc()
      const elementMap = doc.getXmlElement('elementSchema')

      const ids: string[] = []
      const elements: Y.XmlElement[] = []

      for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
        const id = generateId()
        const element = new Y.XmlElement('div')

        element.setAttribute('cml-id', id)
        element.setAttribute('width', '100')
        element.setAttribute('height', '200')

        elements.push(element)
        ids.push(id)
      }

      elementMap.insert(0, elements)

      const update1v1 = Y.encodeStateAsUpdate(doc)
      const update1v2 = Y.encodeStateAsUpdateV2(doc)
      const json1V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Insert doc size:',
        formatBytes(update1v1.byteLength),
        '(v1)',
        formatBytes(update1v2.byteLength),
        '(v2)',
        formatBytes(json1V2.length),
        '(json)',
      )

      // update the width and height of all elements, 1000 times
      for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
        ids.forEach((id, index) => {
          const element = elementMap.get(index)!
          element.setAttribute('width', getRandomInt(1000).toString())
          element.setAttribute('height', getRandomInt(1000).toString())
        })
      }

      const update2v1 = Y.encodeStateAsUpdate(doc)
      const update2v2 = Y.encodeStateAsUpdateV2(doc)
      const json2V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Updated doc size:',
        formatBytes(update2v1.byteLength),
        '(v1)',
        formatBytes(update2v2.byteLength),
        '(v2)',
        formatBytes(json2V2.length),
        '(json)',
      )
    })
  })

  describe('using YXmlElement on root', () => {
    it('updates attributes a lot', () => {
      const doc = new Y.Doc()

      const ids: string[] = []

      for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
        const id = generateId()
        const element = doc.getXmlElement(id)
        element.nodeName = 'div'
        element.setAttribute('width', '100')
        element.setAttribute('height', '200')
        ids.push(id)
      }

      const update1v1 = Y.encodeStateAsUpdate(doc)
      const update1v2 = Y.encodeStateAsUpdateV2(doc)
      const json1V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Insert doc size:',
        formatBytes(update1v1.byteLength),
        '(v1)',
        formatBytes(update1v2.byteLength),
        '(v2)',
        formatBytes(json1V2.length),
        '(json)',
      )

      // update the width and height of all elements, 1000 times
      for (let i = 0; i < NUMBER_OF_UPDATES; i++) {
        ids.forEach((id) => {
          const element = doc.getXmlElement(id)!
          element.setAttribute('width', getRandomInt(1000).toString())
          element.setAttribute('height', getRandomInt(1000).toString())
        })
      }

      const update2v1 = Y.encodeStateAsUpdate(doc)
      const update2v2 = Y.encodeStateAsUpdateV2(doc)
      const json2V2 = JSON.stringify(doc.toJSON())
      console.log(
        'Updated doc size:',
        formatBytes(update2v1.byteLength),
        '(v1)',
        formatBytes(update2v2.byteLength),
        '(v2)',
        formatBytes(json2V2.length),
        '(json)',
      )
    })
  })
})

