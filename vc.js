
(async()=>{
    const v=[
        {p:1316453366403072,c:"CRMNUICLHCMT1",s:"c847bfced76531f9f5ad608e27756b312e3a31d4769fe9e07135f07f1902b276"},
        {p:1316453358276608,c:"CRMNUICLSOUTHT1",s:"14bac24168c50efa23b84f0c40d2a5002855b3e66be9f6405977d2898006973f"}
    ];
    
    const d=document,b=d.body,o=d.createElement("div");
    o.innerHTML='<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border-radius:10px;z-index:999999;box-shadow:0 0 20px rgba(0,0,0,.5)"><div id="qi"></div><p id="qs">⏳</p></div>';
    b.appendChild(o);
    
    const $=id=>d.getElementById(id);
    
    try{
        const q=await(await fetch("/api/v2/authentication/gen_qrcode")).json();
        $("qi").innerHTML=`<img src="data:image/png;base64,${q.data.qrcode_base64}" width=180>`;
        $("qs").textContent="📱 Quét QR";
        
        let t;
        for(let i=0;i<60&&!t;i++){
            await new Promise(r=>setTimeout(r,2e3));
            const s=await(await fetch("/api/v2/authentication/qrcode_status?qrcode_id="+encodeURIComponent(q.data.qrcode_id))).json();
            if(s.data?.status==="CONFIRMED")t=s.data.qrcode_token;
            else if(s.data?.status==="EXPIRED"){$("qs").textContent="⏰ Hết hạn";return}
        }
        
        if(!t){$("qs").textContent="⏰ Timeout";return}
        
        $("qs").textContent="🔐 Login...";
        await fetch("/api/v2/authentication/qrcode_login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({qrcode_token:t})});
        
        $("qs").textContent="🎫 Saving...";
        let ok=0;
        for(const x of v){
            const r=await(await fetch("/api/v2/voucher_wallet/save_vouchers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({voucher_identifiers:[{promotion_id:x.p,voucher_code:x.c,signature:x.s,signature_source:0}],need_user_voucher_status:!0})})).json();
            r.error===0&&ok++
        }
        
        $("qs").textContent=`✅ ${ok}/${v.length}`;
        setTimeout(()=>o.remove(),2e3)
    }catch(e){
        $("qs").textContent="❌"+e
    }
})();
