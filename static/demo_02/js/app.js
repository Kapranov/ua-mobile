
var App = Ember.Application.create();


App.todos = Ember.ArrayController.create({
  content: [
    Ember.Object.create({isDone: true}),
    Ember.Object.create({isDone: true}),
    Ember.Object.create({isDone: false}),
  ],
  appendTodo: (function () {
    this.get('content').pushObject(
      Ember.Object.create({isDone: false})
    )
  })
});

/// Views
App.ApplicationView = Ember.View.extend({
  appendTodo: (function () {
    App.todos.appendTodo();
  }),
  todosBinding: 'App.todos'

});

App.TodoView = Ember.View.extend({
  templateName: 'todo',
  content: null,
  didInsertElement: function() {
    this.$('.Todo').show(500);
  }
});



