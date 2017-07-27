/*
렌더링 함수들을 한 단계 더 wrapping해서 최종적으로 simple하게 쓸 수 있게끔
*/

import Matter from 'matter-js';
import {Paintings as Paint, PaintingsHelper as Helper} from './UtilRenders';
import { BinaryTree } from './AVL';
import ctrl from './controller';

const entireWidth = document.documentElement.clientWidth ,
      entireHeight = document.documentElement.clientHeight;

// module aliases
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Composite = Matter.Composite,
      Events = Matter.Events,
      Constraint = Matter.Constraint,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Vertices = Matter.Vertices,
      Common = Matter.Common,
      Svg = Matter.Svg;


const createNode = (() => {
    let basePos = entireWidth/2;
    let adjustPos = {
        x : 0, 
        y : 90, // initial value
        pv : undefined, // 부모노드의 값
        check : true,
        rotation : [],
        rotationBaseNode : undefined,
        height : 90, 
        increase : [200,110,50],
        increaseNum : 0,
    };
    let once = {
        x : basePos,
        y : 90  // initial value
    };

    return class { 
        constructor(v) {
            this.width = 25;
            this.reflect(v);
        }
        reflect(v) {
            if(BinaryTree.insert(adjustPos,v) === 'unable') {
                alert('You cannot make the node over 4 floor (4층이상으로 노드를 만들 수 없음');
                return;
            }
                    
            ctrl.update(BinaryTree.getNodeNum(),BinaryTree.getRoot().value,Helper.getNodeFloor(Paint.pos));
            
            if(!adjustPos.check) return;

            if(once) {
                this.process(once.x,once.y,this.width,v,adjustPos.pv);
                once = false;
            }
            else {
                this.process(basePos + adjustPos.x,adjustPos.y,this.width,v,adjustPos.pv,adjustPos.rotation,adjustPos.rotationBaseNode);
                adjustPos.x = 0
                adjustPos.y = 90;
                adjustPos.rotation = [];
                adjustPos.rotationBaseNode = undefined;
            }
            adjustPos.increaseNum = 0;
        }
        process(x,y,w,v,pv,rotations,baseNode) {
            Paint.renderNode(x,y,w,v,pv,BinaryTree.getRoot(),rotations,baseNode);
        }
        static delete(v) {
            BinaryTree.delete(adjustPos,v);
            Paint.deleteNode(BinaryTree.getRoot(),v);
            adjustPos.rotation = [];
            adjustPos.rotationBaseNode = undefined;
        }
        static getHeight() {
            return adjustPos.height;
        }
        static substituteCall(floors) {
            ctrl.onlyUpdate(floors);
        }
        static substituteCall2() {
            ctrl.onlyUpdate2(BinaryTree.getNodeNum());
        }
    }
})();

const Util = {
    createNode : createNode,
    getHeight : createNode.getHeight,
    substituteCall : createNode.substituteCall,
    substituteCall2 : createNode.substituteCall2,
    delete : createNode.delete
};


export default Util;
