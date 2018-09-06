document.addEventListener('DOMContentLoaded', () => {
  const CLASS_MAPPING = {
    'var': 'keyword',
    'const': 'keyword',
    'let': 'keyword',
    'function': 'keyword',
    'class': 'keyword',
    'if': 'keyword',
    'else': 'keyword',
    'for': 'keyword',
    'while': 'keyword',
    'switch': 'keyword',
    'case': 'keyword',
    'default': 'keyword',
    'break': 'keyword',
    'string': 'string',
    'number': 'number'
  };
  const typeaheadKeys = Object.keys(CLASS_MAPPING).filter(key => CLASS_MAPPING[key] === 'keyword');
  const editor = document.getElementById('editor');
  let currentWord = '';

  editor.addEventListener('keyup', e => {
    currentWord = handleKeyPress(currentWord, e);
    console.log(currentWord);
    let matches = checkTypeAhead(currentWord);
    generateTypeahead(matches);

    delay(function() {
      generateOutput();
    }, 200);
  });

  // Function Declarations

  function checkTypeAhead(currentWord) {
    if (currentWord === '') return [];
    let matches = typeaheadKeys.filter(key => key.startsWith(currentWord));

    if (currentWord[currentWord.length - 1] === '.') {
      // Check for existing objects
      // let objectName = currentWord.slice(0, currentWord.length-1);
      // let regex = new RegExp('\{([^}]+)\}',"g");
      // let object = editor.value.match(regex);
      // console.log(objectName);
      // console.log(object);
    }
    return matches;
  }

  // Only generate HTML once user stops typing
  let delay = (() => {
    let timer = 0;
    return (callback, ms) => {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  function generateOutput() {
    const editor = document.getElementById('editor');
    const output = document.getElementById('output');
    const rows = editor.value.split(/\n/);
    const endingCharacters = [';', ':', ',', '(', ')'];


    while (output.firstChild) {
      output.removeChild(output.firstChild);
    }
    for (let row of rows) {
      let div = document.createElement('div');
      let padding = row.match(/^[ ]+/g) || [""];
      // Regex to get words separated by spaces other than those in quotation marks
      let words = row.match(/(\".*?\"|\'.*?\'|[^"\s]+)+(?=\s*|\s*$)/g) || [""];

      // Add padding to front of div
      let paddingSpan = document.createElement('span');
      paddingSpan.innerHTML = padding[0];
      div.appendChild(paddingSpan);
      // Cycle through the words and determine if any of them need a special class and append to div
      for (let word of words) {
        if (word === '' && words.length === 1) {
          let blankLine = document.createElement('br');
          div.appendChild(blankLine);
        } else {
          let hasEndingCharacter = false;
          let endingCharacter = '';
          if (endingCharacters.includes(word[word.length-1])) {
            endingCharacter = word[word.length-1];
            word = word.slice(0, word.length-1);
            hasEndingCharacter = true;
          }
          let content = document.createElement('span');
          let text = (!hasEndingCharacter) ? word + ' ' : word;

          if (CLASS_MAPPING[word]) {
            content.className = CLASS_MAPPING[word];
          } else if (word.indexOf('\'') != -1 || word.indexOf('"') != -1) {
            content.className = CLASS_MAPPING['string'];
          } else if (!isNaN(word)) {
            content.className = CLASS_MAPPING['number'];
          }

          content.innerHTML = text;
          div.appendChild(content);
          if (hasEndingCharacter) {
            content = document.createElement('span');
            content.innerHTML = endingCharacter + ' ';
            div.appendChild(content);
          }
        }
      }
      output.appendChild(div);
    }
  }

  function generateTypeahead(matches) {
    let popover = document.getElementById('popover');
    while (popover.firstChild) {
      popover.removeChild(popover.firstChild);
    }

    if (matches.length == 0) return;

    matches.map(match => {
      let option = document.createElement('li');
      option.addEventListener('click', (e) => {
        let choosen = e.target.innerHTML;
        let remainingText = choosen.slice(currentWord.length);
        let caretPosition = editor.selectionStart;
        let editorText = editor.value;
        editor.value = editorText.substring(0, caretPosition) + remainingText + editorText.substring(caretPosition);
        generateOutput();
        while (popover.firstChild) {
          popover.removeChild(popover.firstChild);
        }
      });
      option.innerHTML = match;
      popover.appendChild(option);
    });
  }

  function handleKeyPress(currentWord, e) {
    let keycode = e.which || e.keyCode;
    let character = e.key;
    let isPrintable = isPrintableKeycode(keycode);
    let cursorPosition = editor.selectionStart;
    let cursorPositionLength = editor.selectionEnd - editor.selectionStart;
    switch (keycode) {
      case 13:
      case 32:
        // Space or newline was pressed, reset currentWord
        currentWord = '';
        break;
      case 8:
        // Backspace was pressed so remove the character
        // TODO: Known bug - this will not handle selection of text deletion correctly or deletion of character in middle of word
        if (cursorPosition === 0) {
          currentWord = '';
          break;
        }

        currentWord = currentWord.slice(0, currentWord.length - 1);
        break;
      default:
        if (isPrintable) {
          // TODO: Known bug - this will not handle addition of character in middle of word
          currentWord += character;
        }
        break;
    }
    return currentWord;
  }

  function isPrintableKeycode(keycode) {
    var isPrintable =
        (keycode > 47 && keycode < 58)   || // number keys
        keycode == 32 || keycode == 13   || // spacebar & return key(s)
        (keycode > 64 && keycode < 91)   || // letter keys
        (keycode > 95 && keycode < 112)  || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223);   // [\]' (in order)

    return isPrintable;
  }
});
