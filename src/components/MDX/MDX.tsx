import { SafeMdxRenderer } from 'safe-mdx'
import type { ComponentProps } from 'react'
import { mdxComponents } from './mdx-components'

type SafeMdxAst = ComponentProps<typeof SafeMdxRenderer>['mdast']

function MDX({ markdown, mdast }: { markdown: string; mdast: unknown }) {
  return (
    <SafeMdxRenderer
      markdown={markdown}
      mdast={mdast as SafeMdxAst}
      components={mdxComponents}
    />
  )
}

export default MDX
