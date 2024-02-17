import PageLoad from './PageLoad';
import data from './DataCards';
import StateService from './StateService';
import PageController from './PageController';

const pageLoad = new PageLoad(data);
pageLoad.bindToDOM(document.querySelector('.page'));

const stateService = new StateService(localStorage);
const pageCtrl = new PageController(pageLoad, stateService);

pageCtrl.init();
