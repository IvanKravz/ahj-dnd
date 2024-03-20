import PageLoad from './PageLoad';

export default class PageController {
  constructor(pageLoad, stateService) {
    this.pageLoad = pageLoad;
    this.stateService = stateService;
    this.toDo = null;
    this.inProgress = null;
    this.done = null;
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.toDo = document.getElementById('todo').querySelector('.cards');
      this.inProgress = document.getElementById('in-progress').querySelector('.cards');
      this.done = document.getElementById('done').querySelector('.cards');
      this.load();
    });
    window.addEventListener('unload', () => this.save());

    this.pageLoad.elemDOM();
    this.pageLoad.drawUi();

    this.pageLoad.addCards.forEach((elem) => {
      elem.addEventListener('click', (event) => {
        event.preventDefault();

        for (const form of this.pageLoad.forms) {
          if (form.classList.contains('active')) {
            form.classList.remove('active');
          }
        }

        const target = event.target.parentElement.querySelector('.new-card-form');
        target.classList.add('active');
        target.scrollIntoView(false);
      });
    });

    Array.from(this.pageLoad.cancelBtns).forEach((elem) => {
      elem.addEventListener('click', (event) => {
        event.preventDefault();

        for (const form of this.pageLoad.forms) {
          if (form.classList.contains('active')) {
            form.classList.remove('active');
            form.reset();
          }
        }
      });
    });

    this.pageLoad.forms.forEach((item) => item.addEventListener('submit', (event) => {
      event.preventDefault();

      const input = [...item.elements][0];
      input.focus();
      const cardsCol = item.closest('.cards-col');
      const column = cardsCol.children[1];
      PageLoad.createCard(column, input.value);
      item.reset();
      item.classList.remove('active');
    }));

    this.pageLoad.cardsContainer.addEventListener('mouseover', (event) => {
      event.preventDefault();

      const card = event.target.classList.contains('card');
      if (!card) {
        return;
      }
      const cardEl = event.target;
      const delBtn = cardEl.querySelector('.delete-btn');
      delBtn.classList.remove('hidden');
    });

    this.pageLoad.cardsContainer.addEventListener('mouseout', (event) => {
      event.preventDefault();
      const card = event.target.classList.contains('card');
      if (!card) {
        return;
      }
      const currentEl = event.relatedTarget;

      if (!(card && currentEl.classList.contains('input-text'))
        && !(card && currentEl.classList.contains('delete-btn'))) {
        const cardEl = event.target;
        const delBtn = cardEl.querySelector('.delete-btn');
        delBtn.classList.add('hidden');
      }
    });

    this.pageLoad.cardsContainer.addEventListener('mousedown', (event) => {
      const targetCard = event.target;

      if (targetCard.closest('.delete-btn')) {
        PageLoad.deleteCard(targetCard);
      }
    });

    window.addEventListener("load", () => {

    const items = document.querySelectorAll(".card");
    let current = null;
    const boxes = document.querySelectorAll('.cards');

    for (let item of items) {
      item.draggable = true;
      
      item.addEventListener('dragstart', function(e) {
        e.dataTransfer.effectAllowed = 'copyMove';

        let selected = e.target;
        current = item;
      
        for (let it of items) {
          if (it !== current) {
            it.classList.add('hint');
          }
        }

        for (let box of boxes) {
          box.addEventListener('dragover', function(e) {
            e.preventDefault();
          });

          box.addEventListener('drop', function(e) {
            const targetPos = document.elementFromPoint(e.clientX, e.clientY);
            const targetCards = targetPos.closest('.cards');
            
            if (!targetPos) {
              return;
            }
            
            if (targetCards && targetCards === targetPos) {
              targetCards.append(selected);
            } else if (targetCards && targetCards !== targetPos) {
              const card = targetPos.closest('.card');
              card.after(selected);
            }

            e.target.classList.remove("box--hovered");

          });
          
          box.addEventListener('dragenter', function(e) {
            e.dataTransfer.dropEffect = 'copy';
            const card = e.target.classList.contains('card');
            const text = e.target.classList.contains('input-text');

            if (card) {
              e.target.classList.add("box--hovered");
            } else if (box && !text) {
              e.target.classList.add("box--hovered");
            }
          })
          
          box.addEventListener('dragleave', function(e) {
            e.target.classList.remove("box--hovered");
          })
        }
      });

      item.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
          if (item !== current) {
            let currentpos = 0,
              droppedpos = 0;
            for (let it = 0; it < items.length; it++) {
              if (current === items[it]) {
                currentpos = it;
              }
              if (item === items[it]) {
                droppedpos = it;
              }
            }
            if (currentpos < droppedpos) {
              item.parentNode.insertBefore(current, item.nextSibling);
            } else {
              item.parentNode.insertBefore(current, item);
            }
          }
      })
      
      item.addEventListener('dragend', function() {
        for (let it of items) {
          it.classList.remove("hint");      
        }
      });

      item.ondragover = (e) => e.preventDefault();
    }
  })
}

  save() {
    const data = {
      todo: [],
      inProgress: [],
      done: [],
    };
    const toDoCards = this.toDo.querySelectorAll('.card');
    const inProgressCards = this.inProgress.querySelectorAll('.card');
    const doneCards = this.done.querySelectorAll('.card');

    toDoCards.forEach((item) => {
      data.todo.push(item.firstChild.textContent);
    });
    inProgressCards.forEach((item) => {
      data.inProgress.push(item.firstChild.textContent);
    });
    doneCards.forEach((item) => {
      data.done.push(item.firstChild.textContent);
    });

    this.stateService.save(data);
  }

  load() {
    const data = this.stateService.load();

    if (data) {
      data.todo.forEach((item) => {
        PageLoad.createCard(this.toDo, item);
      });
      data.inProgress.forEach((item) => {
        PageLoad.createCard(this.inProgress, item);
      });
      data.done.forEach((item) => {
        PageLoad.createCard(this.done, item);
      });
    }
  } 
}
