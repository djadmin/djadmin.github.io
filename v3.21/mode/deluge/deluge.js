CodeMirror.defineMode("deluge", function(config, parserConfig) {

  var jsonMode = parserConfig.json,
      indentUnit = config.indentUnit,
      statementIndentUnit = parserConfig.statementIndentUnit || indentUnit;

    var words={};
    function define(style,string){
        var split=string.split(' ');
        for(var i = 0; i < split.length; i++){
          words[split[i]]=style;
        }
    };

  //Atoms
  define('atom','true false boolean');

  //Keywords 
  define('keyword','if info alert hide show enable disable add append select deselect clear alert reload');
  

  //Operators
  var operators=['+','-','*','%','^','/','='];
  //Brackets
  var brackets = "([{}])";

  function tokenBase(stream, state) {
      
      //Checking if Multiline commenting on
      if(state.multiLineComment){
        return tokenComment(stream,state);
      }

      // Syntax Highlighting

      var sol=stream.sol();
      var ch=stream.next();
      //console.log("ch->"+ch);

      if(ch===";"){
        return null;
      }
      else if(ch==='<' || ch===">"){
        return "tag";
      }
      else if(ch === "/") {
        if(stream.eat("*")){
          state.tokenize=tokenComment;
          state.multiLineComment=true;
          return tokenComment(stream,state);
        }
        else if(stream.eat("/")){
          stream.skipToEnd();
          return 'comment';
        }
        
      }
      else if(brackets.indexOf(ch)>=0){
          return null;
      }
      /*
      else if(ch === '\'' || ch === '"' || ch === '`') {
          state.tokens.unshift(tokenString(ch));
          return tokenize(stream, state);
      }*/
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      else if(operators.indexOf(ch)>=0)
          return "operator";

      else if (/\d/.test(ch)) {
          stream.eatWhile(/\d/);
          if(!stream.peek())
            return 'number';
          else if(!/\w/.test(stream.peek())) {
            return 'number';
          }
      }
      else{
        
        stream.eatWhile(/[\w\$_]/);//stream.eatWhile(/[\w-]/);
        var cur=stream.current();
        //console.log("cur->"+cur);
        return words.hasOwnProperty(cur) ? words[cur] : null;
      }

  };

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) break;
        escaped = !escaped && next == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return "string";
    };
  }

  function tokenComment(stream, state){
     var mayBeEnd=false,ch;
     while(ch = stream.next()){
      console.log('TC'+ ch);
        if(ch =="/" && mayBeEnd){
          console.log("Comment Ended");
          state.tokenize=tokenBase;
          state.multiLineComment=false;
          break;
        }
        mayBeEnd=(ch=="*");
     }
     return "comment";
  }

  function Context(indented, column, type, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.align = align;
    this.prev = prev;
  }
  function tokenize(stream, state) {
      return (tokenBase) (stream, state);
  };

  return {
    /*
    startState: function(basecolumn) {
      return {
        tokenize: null,
        context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
        indented: 0,
        startOfLine: true
      };
    },*/
    startState: function() {return {tokens:[]};},
    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      return tokenize(stream, state);
    },
    /*
    indent: function(state, textAfter) {
      if (state.tokenize != tokenBase && state.tokenize != null) return CodeMirror.Pass;
      var ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
      if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
      var closing = firstChar == ctx.type;
      if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit);
      else if (ctx.align && (!dontAlignCalls || ctx.type != ")")) return ctx.column + (closing ? 0 : 1);
      else if (ctx.type == ")" && !closing) return ctx.indented + statementIndentUnit;
      else return ctx.indented + (closing ? 0 : indentUnit);
    },
    electricChars: ":{}",
    blockCommentStart: jsonMode ? null : "/*",
    blockCommentEnd: jsonMode ? null : "",*/
    lineComment: jsonMode ? null : "//",
    fold: "brace"
  };

});

CodeMirror.defineMIME("text/deluge", "deluge");
