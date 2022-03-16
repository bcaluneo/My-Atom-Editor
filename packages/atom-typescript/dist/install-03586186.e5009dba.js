var e=require("atom");class t{constructor(e,t){this.name=e,this.dependencies=t;const n=atom.notifications.addInfo(`Installing ${e} dependencies`,{detail:"Installing "+t.map((e=>e.name)).join(", "),dismissable:!0}),s=document.createElement("progress");this.dispose=function(){n.dismiss()},this.advance=function(){s.value+=1},s.max=t.length,s.style.width="100%";try{let e=atom.views.getView(n);null!=e&&null!=e.element&&(e=e.element);const t=e.querySelector(".detail-content")||e.querySelector(".content");t&&t.appendChild(s)}catch(e){}}complete(e){if(this.dispose(),!e.size)return void atom.notifications.addSuccess(`Installed ${this.name} dependencies`,{detail:"Installed "+this.dependencies.map((e=>e.name)).join(", ")});const t=[];e.forEach(((e,n)=>{t.push("  • "+n)})),atom.notifications.addWarning(`Failed to install ${this.name} dependencies`,{detail:"These packages were not installed, check your console\nfor more info.\n"+t.join("\n"),dismissable:!0})}}const n=new Set(["✓","done"]),s=/(?:Installing|Moving) (.*?) to .* (.*)/;exports.performInstall=async function(a,o){const i=new t(a,o),c=await function(t,a){const o=new Map;return Promise.all(t.map((function(t){return(i=atom.packages.getApmPath(),c=["install",t.url||t.name,"--production","--color","false"],new Promise((function(t){const n={stdout:[],stderr:[]};new e.BufferedProcess({command:i,args:c,stdout(e){n.stdout.push(e)},stderr(e){n.stderr.push(e)},exit(){t({stdout:n.stdout.join(""),stderr:n.stderr.join("")})},autoStart:!1}).start()}))).then((function(e){let o=s.test(e.stdout);if(o){const t=s.exec(e.stdout);o=t&&n.has(t[2])}if(a(t.name,!!o),!o){const n=new Error("Error installing dependency: "+t.name);throw n.stack=e.stderr,n}})).catch((function(e){o.set(t.name,e)}));var i,c}))).then((function(){return o}))}(o,(function(){i.advance()}));return i.complete(c),Promise.all(o.map((e=>c.has(e.name)?null:atom.packages.activatePackage(e.name))))};
//# sourceMappingURL=install-03586186.e5009dba.js.map
