import * as React from "react"
import { graphql } from "gatsby"

export default ({ data }) => <div>{data.rickAndMorty.character.name}</div>

export const query = graphql`
  query {
    rickAndMorty {
      character(id: 1) {
        name
      }
    }
  }
`
