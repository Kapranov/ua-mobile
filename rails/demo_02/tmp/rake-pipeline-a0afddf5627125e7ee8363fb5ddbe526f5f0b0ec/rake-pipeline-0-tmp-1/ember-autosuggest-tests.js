minispade.register('ember-autosuggest/~tests/autosuggest_tests', "(function() {minispade.require('ember-autosuggest/~tests/test_helper');\n\nvar get = Ember.get,\n    set = Ember.set,\n    precompileTemplate = Ember.Handlebars.compile;\n\nvar App, find, click, fillIn, visit;\n\nvar indexController, controller, component, source;\n\nmodule(\"AutoSuggestComponent\", {\n  setup: function(){\n    Ember.$('<style>#ember-testing-container { position: absolute; background: white; bottom: 0; right: 0; width: 640px; height: 384px; overflow: auto; z-index: 9999; border: 1px solid #ccc; } #ember-testing { zoom: 50%; }</style>').appendTo('head');\n    Ember.$('<style>.hdn{ display: none; }ul.suggestions{ border: 1px solid red; }</style>').appendTo('head');\n    Ember.$('<div id=\"ember-testing-container\"><div id=\"ember-testing\"></div></div>').appendTo('body');\n\n    indexController = Ember.ArrayController.extend({\n      init: function(){\n        this._super.apply(this, arguments);\n        set(this, 'content',  Ember.A([\n          Ember.Object.create({id: 1, name: \"Bob Hoskins\"}),\n          Ember.Object.create({id: 2, name: \"Michael Collins\"}),\n          Ember.Object.create({id: 3, name: \"Paul Cowan\"}),\n        ]));\n\n        set(this, 'tags', Ember.ArrayProxy.create({content: Ember.A()}));\n      }\n    });\n\n    Ember.run(function() {\n      window.App = App = Ember.Application.create({\n        rootElement: '#ember-testing'\n      });\n\n      App.Store = DS.Store.extend({\n        adapter: DS.FixtureAdapter.extend({\n          simulateRemoteResponse: true,\n          latency: 200\n        })\n      });\n\n      Ember.TEMPLATES.application = precompileTemplate(\n        \"{{outlet}}\"\n      );\n\n      Ember.TEMPLATES.index = precompileTemplate(\n        \"<div id='ember-testing-container'>\" +\n        \"  <div id='ember-testing'>\" + \n        \"    {{auto-suggest source=model destination=tags minChars=0}}\" +\n        \"  </div>\" +\n        \"</div>\"\n      );\n\n      App.AutoSuggestComponent = window.AutoSuggestComponent;\n      App.IndexController = indexController;\n\n      App.Router.map(function() {\n        this.route('index', {path: '/'});\n      });\n\n      App.setupForTesting();\n    });\n\n    Ember.run(function(){\n      App.advanceReadiness();\n    });\n\n    App.injectTestHelpers();\n\n    find = window.find;\n    click = window.click;\n    fillIn = window.fillIn;\n    visit = window.visit;\n\n    // FIXME: Is there a cleaner way of getting the instances \n    controller = App.__container__.lookup('controller:index');\n    component = App.__container__.lookup('component:autoSuggest');\n  },\n  teardown: function(){\n    Ember.TEMPLATES = {};\n    Ember.run(function(){\n      get(controller, 'tags').clear();\n    });\n    App.removeTestHelpers();\n    Ember.$('#ember-testing-container, #ember-testing').remove();\n    Ember.run(App, App.destroy);\n    App = null;\n  }\n});\n\ntest(\"autosuggest DOM elements are setup\", function(){\n  expect(4);\n  visit('/').then(function() {\n    ok(Ember.$('div.autosuggest'), \"autosuggest component in view\");\n    ok(Ember.$('input.autosuggest').length, \"suggestion input in DOM.\");\n    ok(Ember.$('ul.selections').length, \"selections ul in DOM\");\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"results ul is initially not displayed\");\n  });\n});\n\ntest(\"a no results message is displayed when no match is found\", function(){\n  expect(3);\n\n  visit('/').then(function(){\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"precon - results ul is initially not displayed\");\n  })\n  .fillIn('input.autosuggest', 'xxxx').then(function(){\n    ok(Ember.$('ul.suggestions').is(':visible'), \"results ul is displayed.\");\n    equal(find('.results .suggestions .no-results').html(), \"No Results.\", \"No results message is displayed.\");\n  });\n});\n\ntest(\"Search results should be filtered\", function(){\n  expect(4);\n\n  equal(get(controller, 'content.length'), 3, \"precon - 3 possible selections exist\");\n\n  visit('/').then(function(){\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"precon - results ul is initially not displayed\");\n  })\n  .fillIn('input.autosuggest', 'Paul').then(function(){\n    var el = find('.results .suggestions li.result span');\n    equal(el.length, 1, \"1 search result exists\");\n    equal(el.text().trim(), \"Paul Cowan\", \"1 search result is visible.\");\n  });\n});\n\ntest(\"A selection can be added\", function(){\n  expect(6);\n\n  equal(get(controller, 'tags.length'), 0, \"precon - no selections have been added.\");\n  visit('/')\n  .fillIn('input.autosuggest', 'Paul')\n  .click('.results .suggestions li.result').then(function(){\n    equal(get(controller, 'tags.length'), 1, \"1 selection has been added.\");\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"1 selection element has been added\");\n    ok(/Paul Cowan/.test(el.first().text()), \"Correct text displayed in element.\");\n    var suggestions = find('.results .suggestions li.result');\n    equal(suggestions.length, 0, \"No suggestions are visible.\");\n    var noResults = find('.suggestions .no-results');\n    equal(noResults.is(':visible'), false, \"No results message is not displayed.\");\n  });\n});\n\ntest(\"Don't display a suggestion that has already been selected\", function(){\n  expect(3);\n\n  visit('/')\n  .fillIn('input.autosuggest', 'Paul')\n  .click('.results .suggestions li.result').then(function(){\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"precon - 1 selection element has been added\");\n  }).fillIn('input.autosuggest', 'Paul').then(function(){\n    var suggestions = find('.results .suggestions li.result');\n    equal(suggestions.length, 0, \"no suggestion for selected item.\");\n    equal(find('.results .suggestions .no-results').html(), \"No Results.\", \"No results message is displayed.\");\n  });\n});\n\ntest(\"A selection can be removed\", function(){\n  expect(4);\n\n  visit('/')\n  .fillIn('input.autosuggest', 'Paul')\n  .click('.results .suggestions li.result').then(function(){\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"precon - 1 selection element has been added\");\n    var close = find('.as-close');\n    equal(close.length, 1, \"precon - only one close link is on the page\");\n  }).click('.as-close').then(function(){\n    var el = find('.selections li.selection');\n    equal(el.length, 0, \"precon - there are now no suggestions after removeSelection.\");\n    equal(get(controller, 'tags.length'), 0, \"The controller has 0 tags after removeSelection.\");\n  });\n});\n\ntest(\"key down and key up change the active elemnt\", function(){\n  visit('/')\n  .fillIn('input.autosuggest', 'a')\n  .keyEvent('input.autosuggest', 'keydown', 40).then(function(){\n    var active = find('.results li.result.active');\n\n    equal(1, active.length, \"only one element is active\");\n    equal(\"Michael Collins\", active.text().trim(), \"Correct result is highlighted\");\n  }).keyEvent('input.autosuggest', 'keydown', 40).then(function(){\n    var active = find('.results li.result.active');\n\n    equal(1, active.length, \"only one element is active\");\n    equal(\"Paul Cowan\", active.text().trim(), \"Correct result is highlighted\");\n  }).keyEvent('input.autosuggest', 'keydown', 38).then(function(){\n    var active = find('.results li.result.active');\n\n    equal(1, active.length, \"only one element is active\");\n    equal(\"Michael Collins\", active.text().trim(), \"Correct result is highlighted\");\n  });\n});\n\ntest(\"pressing enter on a selected item adds the selection to the destination\", function(){\n  visit('/')\n  .fillIn('input.autosuggest', 'Michael')\n  .keyEvent('input.autosuggest', 'keydown', 40).then(function(){\n    var active = find('.results li.result.active');\n\n    equal(1, active.length, \"only one element is active\");\n    equal(\"Michael Collins\", active.text().trim(), \"Correct result is highlighted\");\n  }).keyEvent('input.autosuggest', 'keydown', 13).then(function(){\n    equal(get(controller, 'tags.length'), 1, \"1 selection has been added.\");\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"1 selection element has been added\");\n    ok(/Michael Collins/.test(el.first().text()), \"Correct text displayed in element.\");\n  });\n});\n\n})();\n//@ sourceURL=ember-autosuggest/~tests/autosuggest_tests");minispade.register('ember-autosuggest/~tests/customisations_tests', "(function() {minispade.require('ember-autosuggest/~tests/test_helper');\n\nvar get = Ember.get,\n    set = Ember.set,\n    precompileTemplate = Ember.Handlebars.compile;\n\nvar App, find, click, fillIn, visit;\n\nvar indexController, controller, component, source;\n\nmodule(\"Customisations\", {\n  setup: function(){\n    Ember.$('<style>#ember-testing-container { position: absolute; background: white; bottom: 0; right: 0; width: 640px; height: 384px; overflow: auto; z-index: 9999; border: 1px solid #ccc; } #ember-testing { zoom: 50%; }</style>').appendTo('head');\n    Ember.$('<style>.hdn{ display: none; }ul.suggestions{ border: 1px solid red; }</style>').appendTo('head');\n    Ember.$('<div id=\"ember-testing-container\"><div id=\"ember-testing\"></div></div>').appendTo('body');\n\n    indexController = Ember.ArrayController.extend({\n      init: function(){\n        this._super.apply(this, arguments);\n        set(this, 'content',  Ember.A([\n          Ember.Object.create({id: 1, name: \"Bob Hoskins\"}),\n          Ember.Object.create({id: 2, name: \"Michael Collins\"}),\n          Ember.Object.create({id: 3, name: \"Paul Cowan\"}),\n        ]));\n\n        set(this, 'tags', Ember.ArrayProxy.create({content: Ember.A()}));\n      }\n    });\n\n    Ember.run(function() {\n      window.App = App = Ember.Application.create({\n        rootElement: '#ember-testing'\n      });\n\n      App.Store = DS.Store.extend({\n        revision: 13,\n        adapter: DS.FixtureAdapter.extend({\n          simulateRemoteResponse: true,\n          latency: 200\n        })\n      });\n\n      Ember.TEMPLATES.application = precompileTemplate(\n        \"{{outlet}}\"\n      );\n\n      Ember.TEMPLATES.index = precompileTemplate(\n        \"<div id='ember-testing-container'>\" +\n        \"  <div id='ember-testing'>\" +\n        \"    {{#auto-suggest source=content destination=tags minChars=0}}\" +\n        \"      <strong>CHANGED</strong>\" +\n        \"    {{/auto-suggest}}\" +\n        \"  </div>\" +\n        \"</div>\"\n      );\n\n      App.AutoSuggestComponent = window.AutoSuggestComponent;\n      App.IndexController = indexController;\n\n      App.Router.map(function() {\n        this.route('index', {path: '/'});\n      });\n\n      App.setupForTesting();\n    });\n\n    Ember.run(function(){\n      App.advanceReadiness();\n    });\n\n    App.injectTestHelpers();\n\n    find = window.find;\n    click = window.click;\n    fillIn = window.fillIn;\n    visit = window.visit;\n\n    // FIXME: Is there a cleaner way of getting the instances \n    controller = App.__container__.lookup('controller:index');\n    component = App.__container__.lookup('component:autoSuggest');\n  },\n  teardown: function(){\n    Ember.TEMPLATES = {};\n    Ember.run(function(){\n      get(controller, 'tags').clear();\n    });\n    App.removeTestHelpers();\n    Ember.$('#ember-testing-container, #ember-testing').remove();\n    Ember.run(App, App.destroy);\n    App = null;\n  }\n});\n\ntest(\"Can prepend a customisation in each suggestion\", function(){\n  equal(get(controller, 'content.length'), 3, \"precon - 3 possible selections exist\");\n\n  visit('/').then(function(){\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"precon - results ul is initially not displayed\");\n  })\n  .fillIn('input.autosuggest', 'Paul').then(function(){\n    var el = find('.results .suggestions li.result span');\n    equal(el.length, 1, \"1 search result exists\");\n    equal(el.text().normalize(), \"CHANGED Paul Cowan\", \"Text prepended to suggestions.\");\n  });\n});\n\ntest(\"Can prepend a customisation to each chosen selection\", function(){\n  equal(get(controller, 'content.length'), 3, \"precon - 3 possible selections exist\");\n\n  visit('/').then(function(){\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"precon - results ul is initially not displayed\");\n  })\n  .fillIn('input.autosuggest', 'Paul')\n  .click('.results .suggestions li.result').then(function(){\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"1 selection element has been added\");\n    ok(/CHANGED Paul Cowan/.test(el.text().normalize()), \"Text prepended to selections.\");\n  });\n});\n\n})();\n//@ sourceURL=ember-autosuggest/~tests/customisations_tests");minispade.register('ember-autosuggest/~tests/data_tests', "(function() {minispade.require('ember-autosuggest/~tests/test_helper');\n\nvar get = Ember.get,\n    set = Ember.set,\n    precompileTemplate = Ember.Handlebars.compile;\n\nvar App, find, click, fillIn, visit;\n\nvar indexController, controller, component, source;\n\nmodule(\"Ember.Data source tests\", {\n  setup: function(){\n    Ember.$('<style>#ember-testing-container { position: absolute; background: white; bottom: 0; right: 0; width: 640px; height: 384px; overflow: auto; z-index: 9999; border: 1px solid #ccc; } #ember-testing { zoom: 50%; }</style>').appendTo('head');\n    Ember.$('<style>.hdn{ display: none; }ul.suggestions{ border: 1px solid red; }</style>').appendTo('head');\n    Ember.$('<div id=\"ember-testing-container\"><div id=\"ember-testing\"></div></div>').appendTo('body');\n\n    indexController = Ember.ArrayController.extend({\n      init: function(){\n        this._super.apply(this, arguments);\n        set(this, 'content',  Ember.A([]));\n        set(this, 'chosenEmployees', Ember.ArrayProxy.create({content: Ember.A()}));\n      }\n    });\n\n    Ember.run(function() {\n      window.App = App = Ember.Application.create({\n        rootElement: '#ember-testing'\n      });\n\n      App.FixtureAdapter = DS.FixtureAdapter.extend();\n\n      App.Store = DS.Store.extend({\n        adapter: App.FixtureAdapter.extend({\n          simulateRemoteResponse: true\n          //latency: 200\n        })\n      });\n\n      App.Employee = DS.Model.extend({\n        firstName: DS.attr('string'),\n        surname: DS.attr('string'),\n        age: DS.attr('number'),\n        fullName: Ember.computed(function(){\n             return this.get('firstName') + \" \" + this.get('surname');\n        }).property('firstName', 'surname'),\n      });\n\n      App.Employee.FIXTURES = [\n        {\n            id: 1,\n            firstName: 'Carol',\n            surname: 'Bazooka',\n            age: 42\n        },\n        {\n            id: 2,\n            firstName: 'Bob',\n            surname: 'Smith',\n            age: 67\n        },\n        {\n            id: 3,\n            firstName: 'Michael',\n            surname: 'Carruthers',\n            age: 67\n        },\n        {\n            id: 4,\n            firstName: 'Patrick',\n            surname: 'Bateman',\n            age: 67\n        },\n        {\n            id: 5,\n            firstName: 'Tim',\n            surname: 'Price',\n            age: 67\n        }\n      ];\n\n      App.FixtureAdapter.reopen({\n        queryFixtures: function(fixtures, query){\n          return fixtures.filter(function(employee){\n            var fullName =  employee.firstName + \" \" + employee.surname;\n            return fullName.toLowerCase().search(query.fullName.toLowerCase()) !== -1;\n          });\n        }\n      });\n\n      Ember.TEMPLATES.application = precompileTemplate(\n        \"{{outlet}}\"\n      );\n\n      Ember.TEMPLATES.index = precompileTemplate(\n        \"<div id='ember-testing-container'>\" +\n        \"  <div id='ember-testing'>\" + \n        \"    {{auto-suggest source=App.Employee destination=chosenEmployees searchPath=\\\"fullName\\\" minChars=0}}\" +\n        \"  </div>\" +\n        \"</div>\"\n      );\n\n      App.AutoSuggestComponent = window.AutoSuggestComponent;\n      App.IndexController = indexController;\n\n      App.Router.map(function() {\n        this.route('index', {path: '/'});\n      });\n\n      App.setupForTesting();\n    });\n\n    Ember.run(function(){\n      App.advanceReadiness();\n    });\n\n    App.injectTestHelpers();\n\n    find = window.find;\n    click = window.click;\n    fillIn = window.fillIn;\n    visit = window.visit;\n\n    // FIXME: Is there a cleaner way of getting the instances \n    controller = App.__container__.lookup('controller:index');\n    component = App.__container__.lookup('component:autoSuggest');\n  },\n  teardown: function(){\n    Ember.TEMPLATES = {};\n    Ember.run(function(){\n      get(controller, 'chosenEmployees').clear();\n    });\n    App.removeTestHelpers();\n    Ember.$('#ember-testing-container, #ember-testing').remove();\n    Ember.run(App, App.destroy);\n    App = null;\n  }\n});\n\ntest(\"Search results should be filtered and visible\", function(){\n  expect(4);\n\n  visit('/').then(function(){\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"precon - results ul is initially not displayed\");\n  })\n  .fillIn('input.autosuggest', 'Carol').then(function(){\n    ok(Ember.$('ul.suggestions').is(':visible'), \"results ul is displayed.\");\n    var el = find('.results .suggestions li.result span');\n    equal(el.length, 1, \"1 search result exists\");\n    equal(el.text().trim(), \"Carol Bazooka\", \"1 search result is visible.\");\n  });\n});\n\ntest(\"A chosen selection is added to the destination\", function(){\n  visit('/')\n  .fillIn('input.autosuggest', 'Carol')\n  .click('.results .suggestions li.result').then(function(){\n    equal(get(controller, 'chosenEmployees.length'), 1, \"1 selection has been added.\");\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"1 selection element has been added\");\n    ok(/Carol Bazooka/.test(el.first().text()), \"Correct text displayed in element.\");\n    var suggestions = find('.results .suggestions li.result');\n    equal(suggestions.length, 0, \"No suggestions are visible.\");\n    var noResults = find('.suggestions .no-results');\n    equal(noResults.is(':visible'), false, \"No results message is not displayed.\");\n  });\n});\n\n})();\n//@ sourceURL=ember-autosuggest/~tests/data_tests");minispade.register('ember-autosuggest/~tests/test_helper', "(function() {String.prototype.normalize = function(){\n  return this.trim().replace(/\\s{2,}/g, ' ');\n};\n\n})();\n//@ sourceURL=ember-autosuggest/~tests/test_helper");