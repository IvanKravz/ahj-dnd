import PageLoad from './PageLoad';
import Sortable from "sortablejs";

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
      const previousEl = event.target;
      const currentEl = event.relatedTarget;
      if (!(previousEl.classList.contains('card') && currentEl.classList.contains('input-text'))
        && !(previousEl.classList.contains('card') && currentEl.classList.contains('delete-btn'))) {
        const cardEl = event.target;
        const delBtn = cardEl.querySelector('.delete-btn');
        delBtn.classList.add('hidden');
      }
    });

    const columnsCards = document.querySelectorAll(".cards");

    for (const columnCard of columnsCards) {
      new Sortable(columnCard, {
        group: "shared",
        animation: 300,
        draggable: ".card",
        forceFallback: true,
        onChoose: () => {
          document.body.classList.add("grabbing");
        },
        onUnchoose: () => {
          document.body.classList.remove("grabbing");
        },
      })
    }
   
    this.pageLoad.cardsContainer.addEventListener('mousedown', (event) => {
      const targetCard = event.target;

      if (targetCard.closest('.delete-btn')) {
        PageLoad.deleteCard(targetCard);
      }
    });
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
