// index.js

/**
 * The remark plugin for supporting custom id and default id
 * @author imcuttle
 */

const visit = require('unist-util-visit')
const { setNodeId, getDefaultId } = require('./util')



module.exports = function(options = { defaults: false, uniqueDefaults: true }) {
  // Move uniqueDefaultIdsCounters outside of the main function to persist across calls

  return function(node) {
    const uniqueDefaultIdsCounters = {}
    visit(node, 'heading', node => {
      let lastChild = node.children[node.children.length - 1]
      if (lastChild && lastChild.type === 'text') {
        let string = lastChild.value.replace(/ +$/, '')
        let matched = string.match(/ {#([^]+?)}$/)

        if (matched) {
          let id = matched[1]
          if (!!id.length) {
            setNodeId(node, id)

            string = string.substring(0, matched.index)
            lastChild.value = string
            return
          }
        }
      }

      if (options.defaults) {
        // If no custom id was found, use default instead
        let defaultIdCandidate = getDefaultId(node.children);
        if (options.uniqueDefaults) {
          if (uniqueDefaultIdsCounters[defaultIdCandidate] === undefined) {
            // First time this default id is used: initialize counter
            uniqueDefaultIdsCounters[defaultIdCandidate] = 0;
          } else {
            // Id already used: increment counter and append it to defaultIdCandidate
            uniqueDefaultIdsCounters[defaultIdCandidate]++;
            defaultIdCandidate += "-" + uniqueDefaultIdsCounters[defaultIdCandidate];
          }
        }
        setNodeId(node, defaultIdCandidate);
      }
    })
  }
}
