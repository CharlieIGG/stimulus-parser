import { simple } from "acorn-walk"
import { Parser as AcornParser } from "acorn"
import { Project } from "./project"
import { ControllerDefinition, defaultValuesForType } from "./controller_definition"
import { NodeElement, PropertyValue } from "./types"
import { ast, query } from '@phenomnomnominal/tsquery'
import type { Program } from "acorn"
import { ScriptKind, Node } from "typescript"

type NestedArray<T> = T | NestedArray<T>[]
type NestedObject<T> = {
  [k: string]: T | NestedObject<T>
}

export class Parser {
  private readonly project: Project
  private parser: typeof AcornParser

  constructor(project: Project) {
    this.project = project
    this.parser = AcornParser
  }

  parse(code: string) {
    return ast(code, "", ScriptKind.TS)
  }

  parseController(code: string, filename: string) {
    try {
      const ast = this.parse(code)
      const controller = new ControllerDefinition(this.project, filename)
      // MethodDefinition(node: any): void {
      //   if (node.kind === "method") {
      //     controller.methods.push(node.key.name)
      //   }
      // },

      const qry = query

      debugger
      query(ast, "MethodDeclaration").forEach((node: any) => {
        controller.methods.push(node.name.escapedText.replace(/^#/, ''))
      })

      query(ast, 'PropertyDeclaration:has([name="targets"])').forEach((node: any) => {
        controller.targets = node.initializer.elements.map((element: any) => element.text)
      })
      query(ast, 'PropertyDeclaration:has([name="classes"])').forEach((node: any) => {
        controller.classes = node.initializer.elements.map((element: any) => element.text)
      })
      query(ast, 'PropertyDeclaration:has([kindName="ArrowFunction"])').forEach((node: any) => {
        controller.methods.push(node.name.escapedText.replace(/^#/, ''))
      })
      // PropertyDefinition(node: any): void {
      //   const { name } = node.key

      //   if (node.value && node.value.type === "ArrowFunctionExpression") {
      //     controller.methods.push(name)
      //   }

      //   if (name === "values") {
      //     node.value.properties.forEach((property: NodeElement) => {
      //       const value = property.value

      //       let type
      //       let defaultValue

      //       if (value.name && typeof value.name === "string") {
      //         type = value.name
      //         defaultValue = defaultValuesForType[type]
      //       } else {
      //         const properties = property.value.properties

      //         const convertArrayExpression = (
      //           value: NodeElement | PropertyValue
      //         ): NestedArray<PropertyValue> => {
      //           return value.elements.map((node) => {
      //             if (node.type === "ArrayExpression") {
      //               return convertArrayExpression(node)
      //             } else {
      //               return node.value
      //             }
      //           })
      //         }

      //         const convertObjectExpression = (
      //           value: PropertyValue
      //         ): NestedObject<PropertyValue> => {
      //           return Object.fromEntries(
      //             value.properties.map((property) => {
      //               const value =
      //                 property.value.type === "ObjectExpression"
      //                   ? convertObjectExpression(property.value)
      //                   : property.value.value

      //               return [property.key.name, value]
      //             })
      //           )
      //         }

      //         const convertProperty = (value: PropertyValue) => {
      //           switch (value.type) {
      //             case "ArrayExpression":
      //               return convertArrayExpression(value)
      //             case "ObjectExpression":
      //               return convertObjectExpression(value)
      //           }
      //         }

      //         const typeProperty = properties.find((property) => property.key.name === "type")
      //         const defaultProperty = properties.find((property) => property.key.name === "default")

      //         type = typeProperty?.value.name || ""
      //         defaultValue = defaultProperty?.value.value

      //         if (!defaultValue && defaultProperty) {
      //           defaultValue = convertProperty(defaultProperty.value)
      //         }
      //       }

      //       controller.values[property.key.name] = {
      //         type: type,
      //         default: defaultValue,
      //       }
      //     })
      //   }
      // },

      return controller
    } catch (error: any) {
      console.error(`Error while parsing controller in '${filename}': ${error.message}`)

      const controller = new ControllerDefinition(this.project, filename)

      controller.parseError = error.message

      return controller
    }
  }
}
