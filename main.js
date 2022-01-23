/* =========================================================

Find and Show - Adobe XD Plugin

------------------------------------------------------------

Ver 0.0.2 - 1st Release
Ver 0.0.3 - 2nd Release
Ver 0.0.4 - 3rd Release
Ver 0.0.5 - 4th Release
Ver 0.0.6 - 5th Release

========================================================= */




const { Artboard, Text, Rectangle, Color, Group, SymbolInstance, selection, root } = require("scenegraph");
const { alert, error } = require("./lib/dialogs.js");

let panel;

function create(selection) {
  const HTML =
    `<style>
            .break {
                flex-wrap: wrap;
            }
            label.row > span {
                color: #8E8E8E;
                width: 20px;
                text-align: right;
                font-size: 9px;
            }
            label.row input {
                flex: 1 1 auto;
            }
            button {
              margin: 0 3px;
            }
            h1 {
              font-size: 13px;
              margin: 10px 0;
              letter-spacing: 0;
            }
            .chk {
              vertical-align: middle;
              width: 100%;
            }
            input[type=checkbox] {
              margin-right: 6px;
            }
            .keyword {
              display: block;
              margin: 5px 0;
              padding: 3px;
              font-size: 15px;
              font-weight: bold;
              background: #ededed;
            }
            .keyword--s {
              font-size: 12px;
              padding: 5px;
              font-weight: normal;
            }
            .resultNum {
              display: block;
              text-align: right;
            }
            .noResult {
              display: block;
              margin: 20px 0 0;
              text-align: center;
            }
            .link {
              display: block;
              padding: 10px 20px 10px 10px;
              border-bottom: 1px solid #ddd;
              background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJpY29ubW9uc3RyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI0IDI0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0NDQ0NDQzt9Cjwvc3R5bGU+Cjxwb2x5Z29uIGlkPSJhcnJvdy0yNSIgY2xhc3M9InN0MCIgcG9pbnRzPSI1LDMgOC4wNTcsMCAyMCwxMiA4LjA1NywyNCA1LDIxIDE0LDEyICIvPgo8L3N2Zz4K');
              background-size: 10px;
              background-position: right 5px center;
              backgtound-repeat: no-repeat;
            }
            .artboard {
              display: block;
              font-size: 90%;
              color: #999;
              padding: 0 0 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .text {
              display: block;
            }
            .obj {
              display: inline-block;
              background: #e3e3e3;
              padding: 2px 3px;
              font-size: 90%;
              margin: 0 0 5px;
              border-radius: 2px;
            }
            .obj--symbol {
              color: #51AD7F;
            }
            .obj--group {
              color: #4CA3DD;
            }
            .highlight {
              background: #FFD700;
              font-weight: bold;
            }
            a:hover {
              background-color: #fff;
            }
            #op1, #op2 {
              margin-left: 20px;
            }
            .show {
                display: block;
                width: auto;
            }
            .hide {
                display: none;
            }
        </style>
        <form method="dialog" id="main">
            <div>
                <label class="row">
                    <input type="text" uxp-quiet="true" id="txtV" value="" placeholder="Search Keyword..." />
                </label>
                <label class="chk">
                  <input type="checkbox" id="regexp">Regular Expression
                </label>
                <label class="chk">
                  <input type="checkbox" id="op1">Global Match
                </label>
                <label class="chk">
                  <input type="checkbox" id="op2">Ignore Case
                </label>
            </div>
            <footer>
              <button id="reset" uxp-variant="secondary">Reset</button>
              <button id="ok" type="submit" uxp-variant="cta">Search</button>
            </footer>
        </form>
        <div id="result"></div>
        `

  function searchText(e) {
    const sTxtValue = document.querySelector("#txtV").value;

    const regChk = document.querySelector("#regexp").checked;
    const op1Chk = document.querySelector("#op1").checked;
    const op2Chk = document.querySelector("#op2").checked;
    if ((sTxtValue == '') || (sTxtValue == undefined) || (sTxtValue.length < 1)) {
      showError();
    } else {
      document.getElementById("result").className = "show";

      let aNode = document.getElementById("result");
      for (let i = aNode.childNodes.length - 1; i >= 0; i--) {
        aNode.removeChild(aNode.childNodes[i]);
      }

      let resultTitle = document.createElement('h1');
      document.getElementById("result").appendChild(resultTitle);

      let ul = document.createElement('ul');
      document.getElementById("result").appendChild(ul);

      let artboard = root.children;
      for (let i = 0; i < artboard.length; i++) {
        if (artboard.at(i).children.length) {
          let abObj = artboard.at(i).children;
          for (let j = 0; j < abObj.length; j++) {
            if (abObj.at(j) instanceof Text) {
              if (abObj.at(j).parent instanceof Artboard) {
                _chk_RegExp2(abObj.at(j), artboard.at(i), abObj.at(j).guid);
              } else {
                _chk_RegExp2(abObj.at(j), artboard.at(i).parent, abObj.at(j).guid, abObj.at(j).parent, abObj.at(j).parent.guid, abObj.at(j).parent.name);
              }
            } else {
              if (abObj.at(j).parent instanceof Artboard) {
                nodeSearch(abObj.at(j), artboard.at(i), abObj.at(j).guid, abObj.at(j).name);
              } else {
                nodeSearch(abObj.at(j), artboard.at(i).parent, abObj.at(j).parent.guid, artboard.at(i).name);
              }
            }
          }
        } else {
          if (artboard.at(i) instanceof Text) {
            _chk_RegExp2(artboard.at(i), artboard.at(i), artboard.at(i).guid);
          }
        }
      }

      let link = document.getElementsByClassName("link");
      for (let i = 0; i < link.length; i++) {
        link[i].addEventListener('click', onSelect);
      }

      resultTitle.innerHTML = 'Search Keyword: <span class="keyword">' + sTxtValue + '</span>';
      if (link.length == 0) {
        resultTitle.innerHTML += '<span class="noResult">No results found</span>';
      } else {
        resultTitle.innerHTML += '<span class="resultNum">' + link.length + ' results</span>';
      }


      /* ==================================================

      Function

      ================================================== */

      function nodeSearch(node, artboard, parentGuid, parentName) {
        if (node instanceof Text) {
          _chk_RegExp2(node, artboard, node.guid, node.parent, parentGuid, parentName);
        } else {
          for(let i = 0; i < node.children.length; i++){
            let child = node.children.at(i);
            if(child){
              nodeSearch(child, artboard, parentGuid, parentName);
            }
          }
        }
      }

      function _chk_RegExp2(obj, artboard, guid, parent, parentGuid, parentName) {
        const gflags = op1Chk ? 'g' : '';
        const iflags = op2Chk ? 'i' : '';
        if (!regChk) {
          if (obj.text.toLowerCase().indexOf(sTxtValue.toLowerCase()) !== -1) {
            _search2(obj, artboard, guid, parent, parentGuid, parentName);
          }
        } else {
          const regexp = new RegExp(sTxtValue, gflags + iflags);//Global Match, Ignore Case
          if (regexp.test(obj.text)) {
            _search2(obj, artboard, guid, parent, parentGuid, parentName);
          }
        }
      }

      function _search2(obj, artboard, guid, parent, parentGuid, parentName) {
        let x = obj.globalBounds.x;
        let y = obj.globalBounds.y;
        let localX = obj.boundsInParent.x;
        let localY = obj.boundsInParent.y;
        let w = obj.globalBounds.width;
        let h = obj.globalBounds.height;
        let li = document.createElement('li');
        ul.appendChild(li);
        let objKind;
        if (parent) {
          if (parent instanceof SymbolInstance) {
            objKind = '<span class="obj obj--symbol">Component: ' + parentName + '</span>';
          } else if (parent instanceof Group) {
            objKind = '<span class="obj obj--group">Group: ' + parentName + '</span>';
          }
        }
        if (obj.text.toUpperCase() == sTxtValue.toUpperCase()) {
          if (parent) {
            if (artboard instanceof Artboard) {
              li.innerHTML = list(x, y, localX, localY, w, h, artboard.name, obj.text, guid, parentGuid, objKind);
            } else {
              li.innerHTML = list(x, y, localX, localY, w, h, 'Pasteboard', obj.text, guid, parentGuid, objKind);
            }
          } else {
            if (artboard instanceof Artboard) {
              li.innerHTML = list(x, y, localX, localY, w, h, artboard.name, obj.text, guid, parentGuid);
            } else {
              li.innerHTML = list(x, y, localX, localY, w, h, 'Pasteboard', obj.text, guid, parentGuid);
            }
          }
        } else {
          let replaceTxt = obj.text.replace(new RegExp(sTxtValue, 'gi'), (match) => `<span class="highlight">${match}</span>`);
          if (parent) {
            if (artboard instanceof Artboard) {
              li.innerHTML = list(x, y, localX, localY, w, h, artboard.name, replaceTxt, guid, parentGuid, objKind);
            } else {
              li.innerHTML = list(x, y, localX, localY, w, h, 'Pasteboard', replaceTxt, guid, parentGuid, objKind);
            }
          } else {
            if (artboard instanceof Artboard) {
              li.innerHTML = list(x, y, localX, localY, w, h, artboard.name, replaceTxt, guid, parentGuid);
            } else {
              li.innerHTML = list(x, y, localX, localY, w, h, 'Pasteboard', replaceTxt, guid, parentGuid);
            }
          }
        }
      }

      function list(x, y, lx, ly, w, h, artboard, text, guid, parentGuid, label) {
        let output;
        if (label) {
          output = '<a class="link" data-x="' + x + '" data-lx="' + lx + '" data-y="' + y + '" data-ly="' + ly + '" data-w="' + w + '" data-h="' + h + '" data-parentguid="' + parentGuid + '" data-guid="' + guid + '"><span class="artboard">' + artboard + '</span>' + label + '<span class="text">' + text + '</span></a>';
        } else {
          output = '<a class="link" data-x="' + x + '" data-lx="' + lx + '" data-y="' + y + '" data-ly="' + ly + '" data-w="' + w + '" data-h="' + h + '" data-parentguid="' + guid + '" data-guid="' + guid + '"><span class="artboard">' + artboard + '</span><span class="text">' + text + '</span></a>';
        }
        return output;
      }

    }

  }


  function onSelect(e) {
    const { editDocument } = require("application");
    const viewport = require("viewport");

    editDocument(selection => {
      let x = e.currentTarget.getAttribute('data-x');
      let y = e.currentTarget.getAttribute('data-y');
      let lx = e.currentTarget.getAttribute('data-lx');
      let ly = e.currentTarget.getAttribute('data-ly');
      let w = e.currentTarget.getAttribute('data-w');
      let h = e.currentTarget.getAttribute('data-h');
      viewport.scrollToCenter(Number(x), Number(y));

      if (selection.items[0]) {
        selection.items = null;
      }

      const artboard = root.children;
      for (let i = 0; i < artboard.length; i++) {
        if (artboard.at(i).children.length) {
          let abObj = artboard.at(i).children;
          for (let j = 0; j < abObj.length; j++) {
            if (abObj.at(j).parent instanceof Artboard) {
              if (abObj.at(j).guid == e.currentTarget.getAttribute('data-parentguid')) {
                selection.items = abObj.at(j);
              }
            } else {
              if (abObj.at(j).parent.guid == e.currentTarget.getAttribute('data-parentguid')) {
                selection.items = abObj.at(j).parent;
              }
            }
          }
        } else {
          if (artboard.at(i).guid == e.currentTarget.getAttribute('data-parentguid')) {
            selection.items = artboard.at(i);
          }
        }
      }

    })
  }

  panel = document.createElement("div");
  panel.innerHTML = HTML;
  panel.querySelector("form").addEventListener("submit", searchText);
  panel.querySelector("#reset").addEventListener("click", removeEl);

  return panel;
}


function removeEl(event) {
  let aNode = document.getElementById("result");
  for (let i = aNode.childNodes.length - 1; i >= 0; i--) {
    aNode.removeChild(aNode.childNodes[i]);
  }

  document.querySelector("#txtV").value = '';
  document.querySelector("#regexp").checked = false;
  document.querySelector("#op1").checked = false;
  document.querySelector("#op2").checked = false;

}

function show(event) {
  if (!panel) event.node.appendChild(create());

  const regChkbox = document.querySelector("#regexp");
  const op1Chkbox = document.querySelector("#op1");
  const op2Chkbox = document.querySelector("#op2");
  regChkbox.checked = false;
  op1Chkbox.disabled = true;
  op2Chkbox.disabled = true;

  regChkbox.addEventListener("change", function(e) {
    if (regChkbox.checked) {
      op1Chkbox.disabled = false;
      op2Chkbox.disabled = false;
    } else {
      op1Chkbox.disabled = true;
      op2Chkbox.disabled = true;
    }
  });
}


function hide(event) {
}


function update(selection) {
  const isSelection = selection.items.length;

  let form = document.querySelector("form");
  let result = document.querySelector("#result");

  form.className = "show";
  if (isSelection) {
    document.querySelector("#txtV").value = selection.items[0].text;
  }
}




async function showError() {
  await error('Error!',
    'This plugin requires you to input search text.',
    'Please check:',
    '* Try again input text.',
    '* Please input 1 or more characters.');
}


module.exports = {
  panels: {
    search: {
      show,
      hide,
      update,
      showError
    }
  }
};