describe("deserializing nested key names", function(){

  describe("when the view has nested naming with []", function() {
    var View = Backbone.View.extend({
      render: function(){
        this.$el.html("\
          <form>\
          <input type='text' name='widget'>\
          <input type='text' name='foo[bar]'>\
          <input type='text' name='foo[baz][quux]'>\
          </form>\
        ");
      }
    });

    var view;

    beforeEach(function() {
      view = new View();
      view.render();

      Backbone.Syphon.deserialize(view, {
        widget: "wombat",
        foo: {
          bar: "baz",
          baz: {
            quux: "qux"
          }
        }
      });
    });

    it("should set root values",function() {
      expect(view.$("[name='widget']")).toHaveValue("wombat");
    });

    it("should set first nested value",function() {
      expect(view.$("[name='foo[bar]']")).toHaveValue("baz");
    });

    it("should set sibling nested value",function() {
      expect(view.$("[name='foo[baz][quux]']")).toHaveValue("qux");
    });

  });

  xdescribe("when the view has nested naming with [] and ends with [] for an array", function() {
    var View = Backbone.View.extend({
      render: function(){
        this.$el.html("\
          <form>\
          <input type='checkbox' name='foo[bar][]' value='baz' checked='checked'>\
          <input type='checkbox' name='foo[bar][]' value='qux' checked='checked'>\
          </form>\
        ");
      }
    });

    var view, result, inputReaders;

    beforeEach(function() {
      view = new View();
      view.render();

      var inputReaders = new Backbone.Syphon.InputReaderSet();
      inputReaders.register("checkbox", function($el){
        return $el.val();
      });

      result = Backbone.Syphon.serialize(view, {
        inputReaders: inputReaders
      });
    });

    it("has a nested property defined",function() {
      expect(result.foo.bar).toBeDefined();
    });

    it("should have the first value",function() {
      expect(result.foo.bar[0]).toBe("baz");
    });

    it("should have the second value",function() {
      expect(result.foo.bar[1]).toBe("qux");
    });
  });

  xdescribe("when the view has nested naming with a .", function() {
    var View = Backbone.View.extend({
      render: function(){
        this.$el.html("\
          <form>\
          <input type='text' name='widget' value='wombat'>\
          <input type='text' name='foo.bar' value='baz'>\
          <input type='text' name='foo.baz.quux' value='qux'>\
          </form>\
        ");
      }
    });

    var view, result;

    beforeEach(function() {
      this.keySplitter = Backbone.Syphon.KeySplitter;

      Backbone.Syphon.KeySplitter = function(key){
        return key.split(".");
      }
      
      view = new View();
      view.render();

      result = Backbone.Syphon.serialize(view);
    });

    afterEach(function(){
      Backbone.Syphon.KeySplitter = this.keySplitter;
    });

    it("has a property defined",function() {
      expect(result.widget).toBeDefined();
    });

    it("retrieves the value for the property",function() {
      expect(result.widget).toBe("wombat");
    });

    it("has a nested property defined",function() {
      expect(result.foo.bar).toBeDefined();
    });

    it("retrieves the value for the nested property",function() {
      expect(result.foo.bar).toBe("baz");
    });

    it("has a nested, sibling property defined",function() {
      expect(result.foo.baz.quux).toBeDefined();
    });

    it("retrieves the value for the nested, sibling property",function() {
      expect(result.foo.baz.quux).toBe("qux");
    });

  });

  xdescribe("when the keys are split by a custom splitter in the serialize call", function() {
    var View = Backbone.View.extend({
      render: function(){
        this.$el.html("\
          <form>\
          <input type='text' name='widget' value='wombat'>\
          <input type='text' name='foo-bar' value='baz'>\
          <input type='text' name='foo-baz-quux' value='qux'>\
          </form>\
        ");
      }
    });

    var view, result;

    beforeEach(function() {
      view = new View();
      view.render();

      result = Backbone.Syphon.serialize(view, {
        keySplitter: function(key){
          return key.split("-");
        }
      });
    });

    it("has a property defined",function() {
      expect(result.widget).toBeDefined();
    });

    it("retrieves the value for the property",function() {
      expect(result.widget).toBe("wombat");
    });

    it("has a nested property defined",function() {
      expect(result.foo.bar).toBeDefined();
    });

    it("retrieves the value for the nested property",function() {
      expect(result.foo.bar).toBe("baz");
    });

    it("has a nested, sibling property defined",function() {
      expect(result.foo.baz.quux).toBeDefined();
    });

    it("retrieves the value for the nested, sibling property",function() {
      expect(result.foo.baz.quux).toBe("qux");
    });

  });

});