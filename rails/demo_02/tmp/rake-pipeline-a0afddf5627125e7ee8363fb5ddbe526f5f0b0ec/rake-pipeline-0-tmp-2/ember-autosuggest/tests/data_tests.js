minispade.register('ember-autosuggest/~tests/data_tests', "(function() {minispade.require('ember-autosuggest/~tests/test_helper');\n\nvar get = Ember.get,\n    set = Ember.set,\n    precompileTemplate = Ember.Handlebars.compile;\n\nvar App, find, click, fillIn, visit;\n\nvar indexController, controller, component, source;\n\nmodule(\"Ember.Data source tests\", {\n  setup: function(){\n    Ember.$('<style>#ember-testing-container { position: absolute; background: white; bottom: 0; right: 0; width: 640px; height: 384px; overflow: auto; z-index: 9999; border: 1px solid #ccc; } #ember-testing { zoom: 50%; }</style>').appendTo('head');\n    Ember.$('<style>.hdn{ display: none; }ul.suggestions{ border: 1px solid red; }</style>').appendTo('head');\n    Ember.$('<div id=\"ember-testing-container\"><div id=\"ember-testing\"></div></div>').appendTo('body');\n\n    indexController = Ember.ArrayController.extend({\n      init: function(){\n        this._super.apply(this, arguments);\n        set(this, 'content',  Ember.A([]));\n        set(this, 'chosenEmployees', Ember.ArrayProxy.create({content: Ember.A()}));\n      }\n    });\n\n    Ember.run(function() {\n      window.App = App = Ember.Application.create({\n        rootElement: '#ember-testing'\n      });\n\n      App.FixtureAdapter = DS.FixtureAdapter.extend();\n\n      App.Store = DS.Store.extend({\n        adapter: App.FixtureAdapter.extend({\n          simulateRemoteResponse: true\n          //latency: 200\n        })\n      });\n\n      App.Employee = DS.Model.extend({\n        firstName: DS.attr('string'),\n        surname: DS.attr('string'),\n        age: DS.attr('number'),\n        fullName: Ember.computed(function(){\n             return this.get('firstName') + \" \" + this.get('surname');\n        }).property('firstName', 'surname'),\n      });\n\n      App.Employee.FIXTURES = [\n        {\n            id: 1,\n            firstName: 'Carol',\n            surname: 'Bazooka',\n            age: 42\n        },\n        {\n            id: 2,\n            firstName: 'Bob',\n            surname: 'Smith',\n            age: 67\n        },\n        {\n            id: 3,\n            firstName: 'Michael',\n            surname: 'Carruthers',\n            age: 67\n        },\n        {\n            id: 4,\n            firstName: 'Patrick',\n            surname: 'Bateman',\n            age: 67\n        },\n        {\n            id: 5,\n            firstName: 'Tim',\n            surname: 'Price',\n            age: 67\n        }\n      ];\n\n      App.FixtureAdapter.reopen({\n        queryFixtures: function(fixtures, query){\n          return fixtures.filter(function(employee){\n            var fullName =  employee.firstName + \" \" + employee.surname;\n            return fullName.toLowerCase().search(query.fullName.toLowerCase()) !== -1;\n          });\n        }\n      });\n\n      Ember.TEMPLATES.application = precompileTemplate(\n        \"{{outlet}}\"\n      );\n\n      Ember.TEMPLATES.index = precompileTemplate(\n        \"<div id='ember-testing-container'>\" +\n        \"  <div id='ember-testing'>\" + \n        \"    {{auto-suggest source=App.Employee destination=chosenEmployees searchPath=\\\"fullName\\\" minChars=0}}\" +\n        \"  </div>\" +\n        \"</div>\"\n      );\n\n      App.AutoSuggestComponent = window.AutoSuggestComponent;\n      App.IndexController = indexController;\n\n      App.Router.map(function() {\n        this.route('index', {path: '/'});\n      });\n\n      App.setupForTesting();\n    });\n\n    Ember.run(function(){\n      App.advanceReadiness();\n    });\n\n    App.injectTestHelpers();\n\n    find = window.find;\n    click = window.click;\n    fillIn = window.fillIn;\n    visit = window.visit;\n\n    // FIXME: Is there a cleaner way of getting the instances \n    controller = App.__container__.lookup('controller:index');\n    component = App.__container__.lookup('component:autoSuggest');\n  },\n  teardown: function(){\n    Ember.TEMPLATES = {};\n    Ember.run(function(){\n      get(controller, 'chosenEmployees').clear();\n    });\n    App.removeTestHelpers();\n    Ember.$('#ember-testing-container, #ember-testing').remove();\n    Ember.run(App, App.destroy);\n    App = null;\n  }\n});\n\ntest(\"Search results should be filtered and visible\", function(){\n  expect(4);\n\n  visit('/').then(function(){\n    equal(Ember.$('ul.suggestions').is(':visible'), false, \"precon - results ul is initially not displayed\");\n  })\n  .fillIn('input.autosuggest', 'Carol').then(function(){\n    ok(Ember.$('ul.suggestions').is(':visible'), \"results ul is displayed.\");\n    var el = find('.results .suggestions li.result span');\n    equal(el.length, 1, \"1 search result exists\");\n    equal(el.text().trim(), \"Carol Bazooka\", \"1 search result is visible.\");\n  });\n});\n\ntest(\"A chosen selection is added to the destination\", function(){\n  visit('/')\n  .fillIn('input.autosuggest', 'Carol')\n  .click('.results .suggestions li.result').then(function(){\n    equal(get(controller, 'chosenEmployees.length'), 1, \"1 selection has been added.\");\n    var el = find('.selections li.selection');\n    equal(el.length, 1, \"1 selection element has been added\");\n    ok(/Carol Bazooka/.test(el.first().text()), \"Correct text displayed in element.\");\n    var suggestions = find('.results .suggestions li.result');\n    equal(suggestions.length, 0, \"No suggestions are visible.\");\n    var noResults = find('.suggestions .no-results');\n    equal(noResults.is(':visible'), false, \"No results message is not displayed.\");\n  });\n});\n\n})();\n//@ sourceURL=ember-autosuggest/~tests/data_tests");