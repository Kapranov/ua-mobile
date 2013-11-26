minispade.register('ember-autosuggest/template', "(function() {var precompileTemplate = Ember.Handlebars.compile;\n\nEmber.TEMPLATES['components/auto-suggest'] = precompileTemplate(\n  \"<ul class='selections'>\" +\n  \"{{#each destination}}\" +\n  \"  <li class=\\\"selection\\\">\" +\n  \"    <a class=\\\"as-close\\\" {{action removeSelection this}}>x</a>\" +\n  \"      {{yield}}\" +\n  \"      {{displayHelper controller.searchPath}}\" +\n  \"  <\\/li>\" +\n  \"{{/each}}\" +\n  \"<li>{{view view.autosuggest value=query moveSelection='moveSelection' selectActive='selectActive' hideResults='hideResults' class='autosuggest'}}<\\/li>\" +\n  \"<\\/ul>\"+\n  \"<div {{bindAttr class=':results hasQuery::hdn'}}>\" +\n     \"<ul class='suggestions'>\" +\n     \"{{#each displayResults}}\" +\n     \"  <li {{action addSelection this}} {{bindAttr class=\\\":result active\\\"}}>\" +\n     \"    <span class=\\\"result-name\\\">\" +\n     \"    {{yield}}\" +\n     \"    {{displayHelper controller.searchPath}}\" +\n     \"    </span>\" +\n     \"  <\\/li>\" +\n     \"{{else}}\" +\n     \" <li class='no-results'>No Results.<\\/li>\" +\n     \"{{/each}}\" +\n     \"<\\/ul>\" +\n  \"<\\/div>\"\n);\n\n})();\n//@ sourceURL=ember-autosuggest/template");