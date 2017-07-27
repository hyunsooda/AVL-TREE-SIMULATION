import * as Dat from 'dat.gui/build/dat.gui.js';
import Util from './UtilClasses';
import { BinaryTree } from './AVL';
import {Paintings as Paint, PaintingsHelper as Helper} from './UtilRenders';

let controller = {
    numOfMax : 15,
    numOfNode : 0,
    rootNode : 0,
    numOfFloor : 0,

    insert : 0,
    remove : 0,
    search : 0,
    execute() {
        execute.remove();
        if(addPrevValue) {
            if(BinaryTree.search(add.getValue()) === null) 
                new Util.createNode(add.getValue());
            else
                alert('It allow not input just same value (중복X) ');

            addPrevValue = 0; 
            add.setValue(0);
            execute = undefined;
        } else if(delPrevValue) {
            if(! (BinaryTree.search(del.getValue()) === null) ) 
                Util.delete(del.getValue());
            else
                alert('There is no have value which inputed (값이없음) ');
            
            delPrevValue = 0;
            del.setValue(0);
            execute = undefined;
        } else if(searchPrevValue) {
            if(Paint.calcSearchDistance(search.getValue()) === null)
                alert('There is no have value which inputed (값이없음) ');
            
            searchPrevValue = 0;
            search.setValue(0);
            execute = undefined;
        }
    }
}

window.setInterval( () => {
    if(addPrevValue !== add.getValue() ) {
        addPrevValue = add.getValue();
        execute = (!execute) ? manage.add(controller,'execute') : execute;
    } else if(delPrevValue !== del.getValue() ) {
        delPrevValue = del.getValue();
        execute = (!execute) ? manage.add(controller,'execute') : execute;
    } else if(searchPrevValue !== search.getValue() ) {
        searchPrevValue = search.getValue();
        execute = (!execute) ? manage.add(controller,'execute') : execute;
    } else if( (addPrevValue && delPrevValue)  ) {
        delPrevValue = addPrevValue = 0;
        del.setValue(0);
        add.setValue(0);
        execute.remove();
        execute = undefined;
    } else if( (addPrevValue && searchPrevValue) ) {
        addPrevValue = searchPrevValue = 0;
        add.setValue(0);
        search.setValue(0);
        execute.remove();
        execute = undefined;
    } else if( (delPrevValue && searchPrevValue) ) {
        searchPrevValue = delPrevValue = 0;
        del.setValue(0);
        search.setValue(0);
        execute.remove();
        execute = undefined;
    } else if( (searchPrevValue && delPrevValue) ) {
        searchPrevValue = delPrevValue = 0;
        search.setValue(0);
        del.setValue(0);
        execute.remove();
        execute = undefined;
    }
},100)


const gui = new Dat.GUI();
const info = gui.addFolder('Information');
const manage = gui.addFolder('manage');
let add,del,search,execute;
let addPrevValue,delPrevValue,searchPrevValue,numOfMax,numOfNode,rootNode,numOfFloor;

numOfMax = info.add(controller,'numOfMax').max(15).min(15);
numOfNode = info.add(controller,'numOfNode');
rootNode = info.add(controller,'rootNode');
numOfFloor = info.add(controller,'numOfFloor');
info.open();


add = manage.add(controller,'insert').max(99).min(0).step(1);
del = manage.add(controller,'remove').max(99).min(0).step(1);
search = manage.add(controller,'search').max(99).min(0).step(1);
manage.open();

addPrevValue = add.getValue();
delPrevValue = del.getValue();
searchPrevValue = search.getValue();


let ctrl = {
    numOfFloor : numOfFloor,
    rootNode : rootNode,
    numOfNode : numOfNode,
    update(nodeNum,root,floors) {
        numOfNode.remove();
        rootNode.remove();
        numOfFloor.remove();
        numOfNode = info.add(controller,'numOfNode').setValue(nodeNum).max(nodeNum).min(nodeNum);
        rootNode = info.add(controller,'rootNode').setValue(root).max(root).min(root);
        numOfFloor = info.add(controller,'numOfFloor').setValue(floors).max(floors).min(floors);
    },
    onlyUpdate(floors) {
        numOfFloor.remove();
        numOfFloor = info.add(controller,'numOfFloor').setValue(floors).max(floors).min(floors);
    },
    onlyUpdate2(nodeNum) {
        numOfNode.remove();
        numOfNode = info.add(controller,'numOfNode').setValue(nodeNum).max(nodeNum).min(nodeNum);
    }
};

export default ctrl;


/*
document.addEventListener('mousedown', (e) => {
    e.preventDefault();   
}, false);
*/