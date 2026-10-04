import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Activity, ArrowRight, Boxes, Cloud, Code2, Container, Cpu, Database,
  GitBranch, Globe2, Layers3, LockKeyhole, Menu, Network, Play, Server,
  ShieldCheck, Sparkles, Terminal, X, Zap
} from "lucide-react";
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  ["01", "SOURCE", "Push to Git"],
  ["02", "BUILD", "Compile & test"],
  ["03", "SECURE", "Scan & verify"],
  ["04", "SHIP", "Containerize"],
  ["05", "DEPLOY", "Release globally"],
  ["06", "OBSERVE", "Measure & recover"]
];

const capabilities = [
  { icon: GitBranch, title: "Continuous delivery", text: "Every commit becomes a repeatable, traceable release." },
  { icon: Container, title: "Container orchestration", text: "Package services once and promote them consistently across environments." },
  { icon: ShieldCheck, title: "Security gates", text: "Build security checks into the path instead of bolting them on later." },
  { icon: Activity, title: "Observability", text: "See deployment health, latency and failures from one control surface." },
  { icon: Cloud, title: "Multi-cloud ready", text: "Keep infrastructure portable across modern cloud environments." },
  { icon: Zap, title: "Fast recovery", text: "Roll back safely when production tells you something changed." }
];

const flowNodes = [
  { id:"source", type:"deploy", position:{x:0,y:120}, data:{label:"SOURCE", sub:"Git push", icon:GitBranch} },
  { id:"build", type:"deploy", position:{x:240,y:0}, data:{label:"BUILD", sub:"CI / CD", icon:Cpu} },
  { id:"secure", type:"deploy", position:{x:240,y:240}, data:{label:"SECURE", sub:"Policy gate", icon:ShieldCheck} },
  { id:"registry", type:"deploy", position:{x:500,y:0}, data:{label:"REGISTRY", sub:"Images", icon:Boxes} },
  { id:"cluster", type:"deploy", position:{x:500,y:240}, data:{label:"CLUSTER", sub:"Kubernetes", icon:Server} },
  { id:"cloud", type:"deploy", position:{x:770,y:120}, data:{label:"CLOUD", sub:"Global release", icon:Cloud} },
  { id:"observe", type:"deploy", position:{x:1010,y:120}, data:{label:"OBSERVE", sub:"Metrics", icon:Activity} }
];

const flowEdges = [
  {id:"e1",source:"source",target:"build",animated:true},
  {id:"e2",source:"source",target:"secure",animated:true},
  {id:"e3",source:"build",target:"registry",animated:true},
  {id:"e4",source:"secure",target:"cluster",animated:true},
  {id:"e5",source:"registry",target:"cloud",animated:true},
  {id:"e6",source:"cluster",target:"cloud",animated:true},
  {id:"e7",source:"cloud",target:"observe",animated:true}
];

function DeployNode({data}) {
  const Icon = data.icon;
  return <div className="deploy-node">
    <Handle type="target" position={Position.Left} />
    <div className="deploy-node-icon"><Icon size={16}/></div>
    <div><b>{data.label}</b><span>{data.sub}</span></div>
    <Handle type="source" position={Position.Right} />
  </div>
}

function DataEdge({id,sourceX,sourceY,targetX,targetY,sourcePosition,targetPosition}) {
  const [path,labelX,labelY] = getBezierPath({sourceX,sourceY,targetX,targetY,sourcePosition,targetPosition});
  return <>
    <BaseEdge id={id} path={path} className="data-edge"/>
    <EdgeLabelRenderer><span className="edge-packet" style={{left:labelX,top:labelY}} /></EdgeLabelRenderer>
  </>
}

const nodeTypes = { deploy: DeployNode };
const edgeTypes = { data: DataEdge };

function InfrastructureScene() {
  const group = useRef();
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.055;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.08;
  });
  const points = Array.from({length:12},(_,i)=> {
    const a=(i/12)*Math.PI*2;
    return [Math.cos(a)*2.3, Math.sin(a*2)*.55, Math.sin(a)*2.3];
  });
  return <group ref={group}>
    <Float speed={1.2} rotationIntensity={.2} floatIntensity={.25}>
      <mesh>
        <icosahedronGeometry args={[1.15,2]}/>
        <meshStandardMaterial color="#071c19" emissive="#39e7b2" emissiveIntensity={.55} wireframe transparent opacity={.72}/>
      </mesh>
      <mesh scale={.72}>
        <icosahedronGeometry args={[1.15,2]}/>
        <meshStandardMaterial color="#061111" emissive="#69dfff" emissiveIntensity={.35} roughness={.3} metalness={.6}/>
      </mesh>
      {points.map((p,i)=><mesh key={i} position={p}>
        <sphereGeometry args={[.055,10,10]}/>
        <meshBasicMaterial color={i%2 ? "#5b8cff" : "#7edcff"}/>
      </mesh>)}
    </Float>
  </group>
}

function HeroVisual() {
  return <div className="hero-3d">
    <Canvas camera={{position:[0,0,6],fov:42}} dpr={[1,1.6]}>
      <ambientLight intensity={.35}/>
      <pointLight position={[3,3,4]} color="#5b8cff" intensity={10}/>
      <pointLight position={[-3,-2,2]} color="#7edcff" intensity={7}/>
      <InfrastructureScene/>
      <Stars radius={20} depth={8} count={900} factor={1.1} saturation={0} fade speed={.3}/>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
    <div className="hero-3d-label top"><span/> CONTROL PLANE</div>
    <div className="hero-3d-label bottom">DEPLOYMENT CORE <span>LIVE</span></div>
  </div>
}

function Reveal({children,className=""}) {
  const reduce = useReducedMotion();
  return <motion.div className={className}
    initial={reduce?false:{opacity:0,y:28}}
    whileInView={reduce?{}:{opacity:1,y:0}}
    viewport={{once:true,amount:.18}}
    transition={{duration:.7,ease:[.22,1,.36,1]}}>
    {children}
  </motion.div>
}

function Navbar() {
  const [open,setOpen]=useState(false);
  const links=["Platform","Architecture","Capabilities","Workflow","Contact"];
  return <header className="nav">
    <div className="nav-inner">
      <a href="#home" className="brand"><span>◈</span> CLOUD<span className="brand-accent">DEPLOY</span></a>
      <nav className={open?"nav-links open":"nav-links"}>
        {links.map(x=><a key={x} href={"#"+x.toLowerCase()} onClick={()=>setOpen(false)}>{x}</a>)}
      </nav>
      <a className="nav-button" href="#contact">START BUILDING <ArrowRight size={14}/></a>
      <button className="menu" onClick={()=>setOpen(v=>!v)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
    </div>
  </header>
}

function App() {
  const root = useRef(null);

  useEffect(()=>{
    const lenis = new Lenis({duration:1.05, smoothWheel:true, syncTouch:false});
    const raf=(time)=>{lenis.raf(time); requestAnimationFrame(raf)};
    requestAnimationFrame(raf);

    const ctx=gsap.context(()=>{
      gsap.utils.toArray(".story-panel").forEach((panel)=>{
        gsap.fromTo(panel,{y:70,opacity:.35},{y:0,opacity:1,duration:1,ease:"power3.out",
          scrollTrigger:{trigger:panel,start:"top 78%",end:"top 42%",scrub:1}});
      });
      gsap.to(".hero-grid-drift",{yPercent:-18,ease:"none",
        scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
      gsap.to(".hero-copy",{yPercent:12,ease:"none",
        scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
      gsap.to(".flow-stem",{height:"100%",ease:"none",
        scrollTrigger:{trigger:"#workflow",start:"top 70%",end:"bottom 60%",scrub:true}});
    },root);
    return ()=>{ctx.revert();lenis.destroy()};
  },[]);

  return <div ref={root}>
    <Navbar/>
    <div className="scroll-line"><span/></div>

    <main>
      <section id="home" className="hero">
        <div className="hero-grid-drift"/>
        <div className="container hero-layout">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot"/> DEPLOYMENT INFRASTRUCTURE / 01</div>
            <h1>Ship <em>without</em><br/><strong>friction.</strong></h1>
            <p className="hero-lede">CloudDeploy turns source code into observable, secure infrastructure with one intelligent release path.</p>
            <div className="hero-actions">
              <a className="button primary" href="#architecture">EXPLORE PLATFORM <ArrowRight size={16}/></a>
              <a className="button ghost" href="#workflow"><Play size={14}/> SEE THE FLOW</a>
            </div>
            <div className="hero-metrics">
              <div><b>99.98%</b><span>release reliability</span></div>
              <div><b>38.2s</b><span>median deployment</span></div>
              <div><b>24/7</b><span>system visibility</span></div>
            </div>
          </div>
          <div className="hero-visual-wrap">
            <HeroVisual/>
          </div>
        </div>
        <div className="hero-ticker"><span>BUILD</span><i/> <span>SECURE</span><i/> <span>SHIP</span><i/> <span>OBSERVE</span><i/> <span>RECOVER</span></div>
      </section>

      <section id="platform" className="manifesto section">
        <div className="container narrow story-panel">
          <div className="eyebrow">02 / THE IDEA</div>
          <h2>Infrastructure should feel like a <em>system</em>, not a collection of tools.</h2>
          <p>CloudDeploy gives engineering teams one visual control plane for the path from commit to production.</p>
        </div>
      </section>

      <section id="architecture" className="architecture section">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">03 / ARCHITECTURE</div><h2>The release graph.</h2></div>
            <p>Move through the system. Every node is a decision, every connection is a data path.</p>
          </div>
          <Reveal className="flow-shell">
            <div className="flow-top"><span><i/> LIVE PIPELINE</span><span>us-east-1 / production</span></div>
            <div className="flow-canvas">
              <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{padding:.16}} proOptions={{hideAttribution:true}} nodesDraggable={false} nodesConnectable={false} zoomOnDoubleClick={false}>
                <Background color="#172423" gap={28} size={1}/>
                <Controls showInteractive={false}/>
                <MiniMap pannable zoomable nodeColor="#1b5e50" maskColor="rgba(2,4,10,.82)"/>
              </ReactFlow>
            </div>
            <div className="flow-bottom"><span>7 active routes</span><span>latency 42ms</span><span className="green">● all systems operational</span></div>
          </Reveal>
        </div>
      </section>

      <section className="story section">
        <div className="container story-layout">
          <div className="story-sticky">
            <div className="eyebrow">04 / RELEASE STORY</div>
            <h2>One path.<br/><em>Every signal.</em></h2>
            <p>Scroll through the lifecycle. CloudDeploy keeps the engineering context connected from the first push to production recovery.</p>
          </div>
          <div className="story-steps">
            <div className="flow-stem"><span/></div>
            {steps.map(([num,title,text],i)=><div className="story-step" key={title}>
              <div className="step-num">{num}</div>
              <div><span className="step-kicker">{title}</span><h3>{text}</h3><p>{[
                "Source stays close to the team. Every change creates a traceable release event.",
                "Build, test and package with deterministic environments and reproducible artifacts.",
                "Policy checks run before the release crosses the trust boundary.",
                "Containers become the portable unit that moves through every environment.",
                "Promote to the cloud with controlled rollout, health checks and rollback.",
                "Observe the result, close the loop and recover automatically when needed."
              ][i]}</p></div>
            </div>)}
          </div>
        </div>
      </section>

      <section id="capabilities" className="capabilities section">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">05 / CAPABILITIES</div><h2>Built for the hard parts.</h2></div>
            <p>Opinionated primitives for teams that care about velocity without losing control.</p>
          </div>
          <div className="cap-grid">
            {capabilities.map(({icon:Icon,title,text},i)=><Reveal key={title} className="cap-card">
              <div className="cap-index">0{i+1}</div><div className="cap-icon"><Icon size={20}/></div>
              <h3>{title}</h3><p>{text}</p><ArrowRight className="cap-arrow" size={17}/>
            </Reveal>)}
          </div>
        </div>
      </section>

      <section id="workflow" className="workflow section">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">06 / WORKFLOW</div><h2>Watch the release move.</h2></div>
            <p>A cinematic deployment trace turns an invisible pipeline into something your whole team can understand.</p>
          </div>
          <div className="trace">
            <div className="trace-line"/>
            {steps.map(([num,title,text],i)=><motion.div key={num} className="trace-card" whileHover={{y:-8}}>
              <span>{num}</span><div className="trace-icon">{i===0?<GitBranch/>:i===1?<Cpu/>:i===2?<LockKeyhole/>:i===3?<Container/>:i===4?<Cloud/>:<Activity/>}</div>
              <small>{title}</small><b>{text}</b>
              <div className="trace-pulse"/>
            </motion.div>)}
          </div>
        </div>
      </section>

      <section className="cta section" id="contact">
        <div className="container cta-box">
          <div className="eyebrow">07 / READY</div>
          <h2>Make deployment<br/><em>disappear.</em></h2>
          <p>Give your engineers a release system that explains itself.</p>
          <a className="button primary large" href="mailto:hello@clouddeploy.dev">START A CONVERSATION <ArrowRight size={17}/></a>
          <div className="cta-grid"/>
        </div>
      </section>
    </main>

    <footer>
      <div className="container footer-inner">
        <a className="brand" href="#home"><span>◈</span> CLOUD<span className="brand-accent">DEPLOY</span></a>
        <span>ENGINEERED FOR THE NEXT RELEASE</span>
        <span>© 2026 CLOUDDEPLOY</span>
      </div>
    </footer>
  </div>
}

createRoot(document.getElementById("root")).render(<App/>);
