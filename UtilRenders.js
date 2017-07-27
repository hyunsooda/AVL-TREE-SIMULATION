/*
렌더링 함수들 제공
*/

import Matter from 'matter-js';
import Util from './UtilClasses';
import { BinaryTree } from './AVL';


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
      Svg = Matter.Svg,
      Vector = Matter.Vector;

const entireWidth = document.documentElement.clientWidth ,
      entireHeight = document.documentElement.clientHeight;

// create an engine
const engine = Engine.create(),
      world = engine.world;

const render = Render.create({
    element: document.body,
    engine: engine,
    options : {
        width : entireWidth,
        height : entireHeight,
        wireframes : false, // for sprite,
        //background : 'white'
    },
});
render.canvas.style.position = 'absolute';
render.canvas.style.left = '0';
render.canvas.style.top = '0';


const runner = Runner.create();

Render.run(render);
Runner.run(runner,engine);

const mouse = Mouse.create(render.canvas);
let mouseConstraint = MouseConstraint.create(engine, {
          mouse : mouse,
          constraint : {
              stiffness : 0.05
          }
});

const wall1 = Bodies.rectangle(entireWidth/2.8,entireHeight/2,500,25,{
    isStatic : true,
    chamfer: { radius: [15, 15, 15, 15] },
    render : {
        fillStyle : '#ffcc99'
    }
});
const wall2 = Bodies.rectangle(entireWidth/1.5,entireHeight/2,500,25,{
    isStatic : true,
    chamfer: { radius: [15, 15, 15, 15] },
    render : {
        fillStyle : '#80e5ff'
    }
})
const wall3 = Bodies.rectangle(entireWidth/1.8,entireHeight/1.65,300,25,{
    isStatic : true,
    chamfer: { radius: [15, 15, 15, 15] },
    render : {
        fillStyle : '#ff8080'
    }
});
const wall4 = Bodies.rectangle(entireWidth/2.1,entireHeight/1.4,400,25,{
    isStatic : true,
    chamfer: { radius: [15, 15, 15, 15] },
    render : {
        fillStyle : '#607D8B'
    }
});
const wall5 = Bodies.rectangle(entireWidth/1.7,entireHeight/1.1,500,25,{
    isStatic : true,
    chamfer: { radius: [15, 15, 15, 15] },
    render : {
        fillStyle : '#8585ad'
    }
});

// width = 150, height = 200
let spritesAvltree = ['A','V','L','T','R','E','E'];
spritesAvltree.splice(0,3).reduce( (prev,cur) => {
    World.add(world,Bodies.rectangle(prev,700,150,200,{
        render : {
            sprite : {
                texture : `imgs/${cur}.png`
            }
        },
        isStatic : true
    }));

    return prev+150;
},75);
spritesAvltree.reduce( (prev,cur) => {
    World.add(world,Bodies.rectangle(prev,850,150,200,{
        render : {
            sprite : {
                texture : `imgs/${cur}.png`
            }
        },
        isStatic : true
    }));

    return prev+150;
},75);





Body.rotate(wall1,Math.PI/180*5);
Body.rotate(wall2,Math.PI/180*-5);
Body.rotate(wall3,Math.PI/180*-10);
Body.rotate(wall4,Math.PI/180*15);
Body.rotate(wall5,Math.PI/180*-20);


World.add(world,[
    mouseConstraint,
    wall1,
    wall2,
    wall3,
    wall4,
    wall5
]);

window.WebFontConfig = {
    google : {
        families: ['Indie Flower','Poiret One']
    }
};

( function () {
    const wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////

class Paintings {
    constructor() {
        this.node = undefined;
        this.numbers = [];
        this.pos = [];
        this.root = undefined;
    }
    static init() {
        this.node = Composite.create({ lable : 'node' });
        this.numbers = [];
        this.pos = [];
        this.searchPos = [];
        this.searchX = entireWidth/2,
        this.searchY = 90;
        this.searchInfo = { bodies : [], restlength : 0, currentBody : undefined };

        Events.on(engine,'afterUpdate', e => {           
            this.displayNumber();
            this.displayConstraint(this.root);
            this.windy();
            
            if(this.searchPos.length)
                this.renderSearch();
            else {
                this.searchPos = [];
                this.searchX = entireWidth/2;
                this.searchY = 90;
                this.searchInfo = { bodies : [], restlength : 0, currentBody : undefined };
            }
                
        });
    }
    static renderNode(x,y,w,v,pv,root,rotations,baseNode) {
        let floors,X;
        const body =  Bodies.circle(x,y,w,{
            label : v
        });
        Composite.addBody(this.node,body);
        World.remove(world,Composite.allBodies(this.node));
        let constraint,options;
        options = {
                bodyA : body,
                pointA : { x : 0, y : -30},
                pointB : { x : x, y : 0},
                label : v,
                render : {
                    visible : false
                }
        }
        
        constraint = Constraint.create(options);
        Composite.addConstraint(this.node,constraint);
        World.add(world,[...this.node.bodies,...this.node.constraints]); //// World.add(world,this.node);  이렇게하면 렉걸림;;

        PaintingsHelper.store_num_pos(this.pos,this.numbers,body);
        this.root = root;

        floors = PaintingsHelper.getNodeFloor(this.pos);
        Util.substituteCall(floors);

        if(rotations && baseNode)
            this.renderRebalance();
    }
    static deleteNode(root,v) {
        let node,
            constraints = Composite.allConstraints(this.node),
            constraint,
            tmp;

        this.root = root;

        for(let i=0; i<this.pos.length; i++) {
            if(this.pos[i].label === v) {
                node = this.pos[i];
                tmp = i;
            }
            if(constraints[i].label === v)
                constraint = constraints[i];
        }

        Composite.remove(this.node,node);
        Composite.remove(this.node,constraint);
        this.pos.splice(tmp,1);
        this.numbers.splice(tmp,1);

        Util.substituteCall2();

        this.renderRebalance();
    }
    static renderRebalance() {
        let pNode,pCNode,pCCNode;
        let constraint;
        let width; 
        let height = Util.getHeight();
        const constraints = Composite.allConstraints(this.node);

        ( () => {
            window.setTimeout( () => {
            World.remove(world,Composite.allConstraints(engine.world));
            Composite.remove(this.node,constraints);            

            PaintingsHelper.recursivePosUpdate(this.root,this.pos,this.node,0,90);

            let floors = PaintingsHelper.getNodeFloor(this.pos);
            Util.substituteCall(floors);

            },1000)
        })();
    }
    static displayNumber() {
        const ctx = render.context;
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '20px Poiret One';
        
        for(let i=0; i<this.numbers.length; i++) {
            const textWidth = ctx.measureText(this.numbers[i]).width / 2;
            ctx.fillText(this.numbers[i],this.pos[i].position.x - textWidth,this.pos[i].position.y + textWidth);
        }
        ctx.restore();
    }
    static displayConstraint(node) {
        const ctx = render.context;

        if(node) {
            if(node.left) {
                let pPos,nPos,obj;
                for(let i=0; i<this.pos.length; i++) {
                    if(this.pos[i].label === node.value)
                        pPos = this.pos[i];
                    if(this.pos[i].label === node.left.value)
                        nPos = this.pos[i];
                }

                ctx.save();
                ctx.beginPath();
                obj = PaintingsHelper.calcDistance(pPos,nPos);
                ctx.moveTo(obj.x1,obj.y1);
                ctx.lineTo(obj.x2,obj.y2);
                ctx.strokeStyle = obj.style;
                ctx.stroke();
                ctx.restore();
                this.displayConstraint(node.left);
            }
            if(node.right) {
                let pPos,nPos,obj;
                for(let j=0; j<this.pos.length; j++) {
                    if(this.pos[j].label === node.value)
                        pPos = this.pos[j];
                    if(this.pos[j].label === node.right.value)
                        nPos = this.pos[j];
                }

                ctx.save();
                ctx.beginPath();
                obj = PaintingsHelper.calcDistance(pPos,nPos);
                ctx.moveTo(obj.x1,obj.y1);
                ctx.lineTo(obj.x2,obj.y2);
                ctx.strokeStyle = obj.style;
                ctx.stroke();
                ctx.restore();
                this.displayConstraint(node.right);
            }
        }

    }
    static calcSearchDistance(v) {
        let nodePath = {
            pos : [],
            values : [],
            cnt : -1
        };
        let finalPos = [];

        if(BinaryTree.search(v,nodePath) === null) 
            return null;

        for(let i=0; i<nodePath.values.length; i++) {
            for(let j=0; j<this.pos.length; j++) {
                if(nodePath.values[i] === this.pos[j].label) {
                    nodePath.pos.push(Vector.clone(this.pos[j].position));
                    break;
                }
            }
        }

        for(let i=0; i<nodePath.pos.length-1; i++) {
            for(let j=0; j<100; j++) {
                let x = nodePath.pos[i+1].x - nodePath.pos[i].x,
                    y = nodePath.pos[i+1].y - nodePath.pos[i].y;

                finalPos.push([x/100,y/100]);
            }
        }

        this.searchInfo.bodies = nodePath.pos;
        this.searchInfo.length = finalPos.length;
        this.searchPos = finalPos;
    }
    static renderSearch() {
        const ctx = render.context;
        let inc = this.searchPos.shift();

        ctx.save();
        ctx.beginPath();

        if( (this.searchPos.length+1) % 100 === 0 ) {
            this.searchInfo.currentBody = this.searchInfo.bodies.shift();
        }
        
        ctx.moveTo(this.searchInfo.currentBody.x,this.searchInfo.currentBody.y);
        ctx.strokeStyle = 'red';
  
        this.searchX += inc[0];
        this.searchY += inc[1];

        ctx.lineTo(this.searchX,this.searchY);
        ctx.stroke();
        ctx.restore();
    }
    static windy() {
        window.setTimeout( () => {
            const bodies = Composite.allBodies(this.node);

            for(let body of bodies) {
                Body.applyForce(body,body.position,{
                    x : 1 * 0.0003,
                    y : 0
                });
            }
        },1000);
    }
}

class PaintingsHelper {
    static store_num_pos(pos,nums,body) {
        pos.push(body);
        nums.push(body.label);
    }
    static createGradient(length) {
        const ctx = render.context;
        const grd = ctx.createLinearGradient(0, 0, length, 0);

        for(let i=0; i<5; i++) 
            grd.addColorStop( (i*2)/10 ,'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6));

        return grd;
    }
    static calcDistance(pPos,nPos) {      
        let x1 = pPos.position.x,
            x2 = nPos.position.x,
            y1 = pPos.position.y,
            y2 = nPos.position.y,
            vector = new Vector2D(x1,y1),
            seta = vector.getSeta(x2,y2),
            vector2 = new Vector2D(x2,y2),
            seta2 = vector2.getSeta(x1,y1);
        
        seta = vector.toRadian(seta);
        seta2 = vector2.toRadian(seta2); 
            
        vector.x = Math.cos(seta) * 25;
        vector.y = Math.sin(seta) * 25;
        
        vector2.x = Math.cos(seta2) * 25;
        vector2.y = Math.sin(seta2) * 25;
        
        x1 += vector.x;
        y1 += vector.y;
        x2 += vector2.x;
        y2 += vector2.y;

        return {
            x1 : x1, 
            y1 : y1, 
            x2 : x2,
            y2 : y2,
            style : PaintingsHelper.createGradient((Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) )))
        }
    }
    static getNodeFloor(pos) {
        if(pos.length === 0) return 1;

        let low = pos[0].position.y,
            high = 0,
            height = Util.getHeight(),
            ret;
        
        for(let i=0; i<pos.length; i++) {
            low = Math.min(pos[i].position.y,low);
            high = Math.max(pos[i].position.y,high);
        }
        ret = (high-low)/height;
        //console.log(`층 수 : ${ret}`);
        return ret+1;
    }

    static recursivePosUpdate(root,pos,composite,width,height) {
        let node,constraint;
        let tmp;

        for(let i=0; i<pos.length; i++) {
            if(pos[i].label === root.value) {
                node = pos[i];
                break;
            }
        }

        if(!node) return;

        Body.setPosition(node,{
            x : entireWidth/2 + width,
            y : height
        });

        switch(Math.abs(width)) {
            case 0 : tmp = 200;
            break;
            case 200 : tmp = 110;
            break;
            case 310 : tmp = 50;
            break;
            case 90 : tmp = 50;
            break;
        }

        constraint = Constraint.create({
            label : node.label, //this.pos[i].label,
            bodyA : node,
            pointA : { x : 0, y : -30},
            pointB : { x : node.position.x, y : 0},
            render : {
                visible : false
            }
        });
        Composite.add(composite,constraint);
        World.add(world,constraint);

        if(root.left) PaintingsHelper.recursivePosUpdate(root.left,pos,composite,width - tmp,height+90);  
        if(root.right) PaintingsHelper.recursivePosUpdate(root.right,pos,composite,width + tmp,height+90);

    }
}

class Vector2D {
    constructor(x=0,y=0) {
        this.x = x;
        this.y = y;
    }
    toRadian(degree) {
        return Math.PI/180 * degree;
    }
    toDegree(radian) {
        return 180*radian / Math.PI;
    }
    gethypotenuse(x2,y2) {
        const subX = Math.abs(x2-this.x),
              subY = Math.abs(y2-this.y),
              hypotenuse = Math.sqrt( subX**2 + subY**2 );

        return hypotenuse;
    }
    getSeta(x2,y2) {
        let seta = Math.asin( Math.abs(y2-this.y) / this.gethypotenuse(x2,y2) );
        seta = this.toDegree(seta);
        
        if(x2 > this.x && this.y > y2)         seta += (180-seta)*2; // 1사분기
        else if(this.x > x2 && this.y > y2)    seta += 180;          // 2사분기
        else if(this.x > x2 && y2 > this.y)    seta += (90-seta)*2;  // 3사분기

        return seta;
    }
}


window.onresize = (e) => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
}

Paintings.init();

export {
    Paintings,PaintingsHelper
}


 /*
        for(let i=0; i<this.pos.length-1; i++) {
            let x1,x2,y1,y2,seta,mx1,my1,mx2,my2;
            x1 = this.pos[i].position.x;
            x2 = this.pos[i+1].position.x;
            y1 = this.pos[i].position.y;
            y2 = this.pos[i+1].position.y;
            
            seta = (y2-y1) / (Math.sqrt( Math.pow( Math.abs(x2-x1),2) + Math.pow(y2-y1,2) )); // beta/r
            seta = (Math.asin(seta)*180) / Math.PI; // arcsin(beta/r)
            seta = (x2 > x1) ? -seta : 180 + seta;  // 자식노드가 right이면 360-seta , left이면 180+seta 

            mx1 = (Math.cos(seta) * 25) + x1;
            my1 = (Math.sin(seta) * 25) + y1;

            ctx.moveTo(this.pos[i].position.x,this.pos[i].position.y);
            ctx.lineTo(this.pos[i+1].position.x,this.pos[i+1].position.y);
            //ctx.moveTo(mx1,my1);
            //ctx.lineTo(x2,y2);

            ctx.strokeStyle = PaintingsHelper.createGradient((Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) )));
            ctx.stroke();
        }
        */