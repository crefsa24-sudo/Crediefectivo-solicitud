const products = {
  'semanal-15': {name:'Crédito Semanal 15 semanas', interestFactor:1.425, term:15, termType:'semanas', minAmount:5000, maxAmount:15000},
  'semanal-31': {name:'Crédito Semanal 31 semanas', interestFactor:1.55, term:31, termType:'semanas', minAmount:5000, maxAmount:15000},
  'diario-21':  {name:'Crédito Diario 21 días', interestFactor:1.55, term:21, termType:'días', minAmount:1000, maxAmount:4000}
};

function v(id){ const el=document.getElementById(id); return el?el.value:''; }
function radioVal(name){ const el=document.querySelector(`input[name="${name}"]:checked`); return el?el.value:''; }
function fmt(n){ return '$'+(Math.round((n||0)*100)/100).toLocaleString('es-MX'); }

function getFormData(){
  return {
    fecha:v('fecha'), ejecutivo:v('ejecutivo'), zona:v('zona'), producto:v('producto'),
    c_nombre:v('c_nombre'), c_ap_paterno:v('c_ap_paterno'), c_ap_materno:v('c_ap_materno'),
    c_dia:v('c_dia'), c_mes:v('c_mes'), c_anio:v('c_anio'), c_sexo:v('c_sexo'), c_estado_civil:v('c_estado_civil'),
    c_cel_personal:v('c_cel_personal'), c_cel_ref:v('c_cel_ref'), c_curp:v('c_curp'),
    c_domicilio:v('c_domicilio'), c_colonia:v('c_colonia'), c_municipio:v('c_municipio'), c_estado:v('c_estado'), c_cp:v('c_cp'),
    c_vivienda:radioVal('c_vivienda'), c_residencia:v('c_residencia'), c_email:v('c_email'),
    c_conyuge:v('c_conyuge'), c_conyuge_cel:v('c_conyuge_cel'),
    c_ocupacion:v('c_ocupacion'), c_empresa:v('c_empresa'), c_empresa_dir:v('c_empresa_dir'),
    c_sueldo:v('c_sueldo'), c_comprueba:radioVal('c_comprueba'), c_otros_ing:v('c_otros_ing'),
    c_g_renta:v('c_g_renta'), c_g_alimentos:v('c_g_alimentos'), c_g_servicios:v('c_g_servicios'),
    c_g_transporte:v('c_g_transporte'), c_g_estudios:v('c_g_estudios'), c_g_otros:v('c_g_otros'),
    c_ing_m1:v('c_ing_m1'), c_ing_m2:v('c_ing_m2'), c_ing_m3:v('c_ing_m3'),
    monto:v('monto'), plazo:v('plazo'), tipo_cliente:radioVal('tipo_cliente'),
    a_nombre:v('a_nombre'), a_ap_paterno:v('a_ap_paterno'), a_ap_materno:v('a_ap_materno'),
    a_dia:v('a_dia'), a_mes:v('a_mes'), a_anio:v('a_anio'), a_sexo:v('a_sexo'), a_estado_civil:v('a_estado_civil'),
    a_cel_personal:v('a_cel_personal'), a_cel_ref:v('a_cel_ref'), a_email:v('a_email'),
    a_domicilio:v('a_domicilio'), a_colonia:v('a_colonia'), a_municipio:v('a_municipio'), a_estado:v('a_estado'), a_cp:v('a_cp'),
    a_vivienda:radioVal('a_vivienda'), a_residencia:v('a_residencia'), a_conyuge:v('a_conyuge'),
    a_ocupacion:v('a_ocupacion'), a_empresa:v('a_empresa'), a_empresa_dir:v('a_empresa_dir'),
    a_sueldo:v('a_sueldo'), a_comprueba:radioVal('a_comprueba'), a_otros_ing:v('a_otros_ing'),
    a_g_renta:v('a_g_renta'), a_g_alimentos:v('a_g_alimentos'), a_g_servicios:v('a_g_servicios'),
    a_g_transporte:v('a_g_transporte'), a_g_estudios:v('a_g_estudios'), a_g_otros:v('a_g_otros'),
    a_ing_m1:v('a_ing_m1'), a_ing_m2:v('a_ing_m2'), a_ing_m3:v('a_ing_m3')
  };
}

function totals(d, p){
  const totalIng = (parseFloat(d[`${p}_sueldo`])||0) + (parseFloat(d[`${p}_otros_ing`])||0);
  const totalGastos = ['renta','alimentos','servicios','transporte','estudios','otros']
    .reduce((s,k)=> s + (parseFloat(d[`${p}_g_${k}`])||0), 0);
  const meses = [d[`${p}_ing_m1`], d[`${p}_ing_m2`], d[`${p}_ing_m3`]].map(x=>parseFloat(x)||0);
  const mesesConDato = meses.filter(x=>x>0);
  const promedioMensual = mesesConDato.length ? meses.reduce((a,b)=>a+b,0)/mesesConDato.length : totalIng;
  const diferencia = promedioMensual - totalGastos;
  const capacidadSemanal = diferencia / 4;
  return {totalIng, totalGastos, diferencia, capacidadSemanal};
}

function updateCalc(){
  const d = getFormData();
  const c = totals(d,'c');
  const a = totals(d,'a');
  document.getElementById('c_total_ing_disp').textContent = fmt(c.totalIng);
  document.getElementById('c_total_gastos_disp').textContent = fmt(c.totalGastos);
  document.getElementById('c_diferencia_disp').textContent = fmt(c.diferencia);
  document.getElementById('c_capacidad_disp').textContent = fmt(c.capacidadSemanal);
  document.getElementById('a_total_ing_disp').textContent = fmt(a.totalIng);
  document.getElementById('a_total_gastos_disp').textContent = fmt(a.totalGastos);
  document.getElementById('a_diferencia_disp').textContent = fmt(a.diferencia);
  document.getElementById('a_capacidad_disp').textContent = fmt(a.capacidadSemanal);
}
document.querySelectorAll('.ing-calc,.gasto-calc,.ing-mes').forEach(inp=>inp.addEventListener('input', updateCalc));

function validateForm(){
  const requiredFields = ['c_nombre','c_ap_paterno','c_cel_personal','c_domicilio','c_sueldo','a_nombre','a_ap_paterno','a_cel_personal','a_domicilio','a_sueldo','monto'];
  let hasError = false;
  requiredFields.forEach(id=>{
    const input = document.getElementById(id);
    const errorMsg = input.closest('.form-group').querySelector('.error-message');
    if(!input.value || input.value.trim()===''){
      input.classList.add('error'); if(errorMsg) errorMsg.classList.add('show'); hasError = true;
    } else { input.classList.remove('error'); if(errorMsg) errorMsg.classList.remove('show'); }
  });
  const producto = document.getElementById('producto').value;
  const monto = parseFloat(document.getElementById('monto').value);
  if(producto && products[producto] && monto){
    if(monto < products[producto].minAmount || monto > products[producto].maxAmount){
      const input = document.getElementById('monto'); input.classList.add('error');
      const em = input.closest('.form-group').querySelector('.error-message');
      em.textContent = `Monto entre $${products[producto].minAmount.toLocaleString()} y $${products[producto].maxAmount.toLocaleString()}`;
      em.classList.add('show'); hasError = true;
    }
  }
  return !hasError;
}

const PDF_CSS = `
    .pdf-doc{font-family:'Segoe UI',Arial,sans-serif;padding:36px;color:#141414;font-size:13px;background:#fff;}
    .pdf-doc .top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #111;padding-bottom:14px;margin-bottom:18px;}
    .pdf-doc .top h1{font-size:22px;letter-spacing:.03em;} .pdf-doc .top h1 small{display:block;font-size:9px;letter-spacing:.2em;color:#888;}
    .pdf-doc .top .t2{font-size:17px;font-weight:800;letter-spacing:.05em;}
    .pdf-doc .meta{display:flex;gap:16px;font-size:11px;color:#555;margin-bottom:18px;flex-wrap:wrap;}
    .pdf-doc .meta span b{color:#111;}
    .pdf-doc .bar{background:#111;color:#fff;padding:6px 12px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-top:16px;}
    .pdf-doc .bar.gold{background:#c8a13a;color:#1c1c1c;}
    .pdf-doc .grid2{display:grid;grid-template-columns:1fr 1fr;}
    .pdf-doc .row{display:flex;padding:5px 12px;border-bottom:1px solid #eee;font-size:12px;}
    .pdf-doc .label{width:180px;font-weight:600;color:#555;flex-shrink:0;} .pdf-doc .value{flex:1;}
    .pdf-doc .calc{display:flex;justify-content:space-between;background:#f6f4ee;padding:8px 12px;font-weight:700;font-size:12.5px;border-top:1px dashed #ccc;}
    .pdf-doc .calc.total{background:#eaf5ee;color:#1f8a5f;}
    .pdf-doc .footer{text-align:center;margin-top:30px;padding-top:14px;border-top:1px solid #ddd;font-size:10.5px;color:#999;}
`;

function generatePDFBody(d){
  const c = totals(d,'c'); const a = totals(d,'a');
  const N = x => parseFloat(x||0).toLocaleString();
  const productInfo = products[d.producto] || {name:'No seleccionado', interestFactor:0, term:0, termType:''};
  const row = (label,value)=>`<div class="row"><span class="label">${label}</span><span class="value">${value||'—'}</span></div>`;
  return `
    <div class="top">
      <h1>CREDIEFECTIVO<small>CASH LOAN FINANCIAL</small></h1>
      <div class="t2">SOLICITUD DE CRÉDITO</div>
    </div>
    <div class="meta">
      <span>Fecha: <b>${d.fecha||'—'}</b></span>
      <span>Ejecutivo: <b>${d.ejecutivo||'—'}</b></span>
      <span>Zona: <b>${d.zona||'—'}</b></span>
      <span>Producto: <b>${productInfo.name}</b></span>
      <span>Folio: <b>CRED-${String(Math.floor(Math.random()*1000000)).padStart(6,'0')}</b></span>
    </div>

    <div class="bar">Datos del cliente</div>
    ${row('Nombre completo', `${d.c_nombre} ${d.c_ap_paterno} ${d.c_ap_materno}`)}
    ${row('Fecha de nacimiento', d.c_dia&&d.c_mes&&d.c_anio ? `${d.c_dia}/${d.c_mes}/${d.c_anio}` : '—')}
    ${row('Sexo / Estado civil', `${d.c_sexo||'—'} / ${d.c_estado_civil||'—'}`)}
    ${row('Celular personal / referencia', `${d.c_cel_personal||'—'} / ${d.c_cel_ref||'—'}`)}
    ${row('CURP', d.c_curp)}
    ${row('Domicilio', `${d.c_domicilio}, ${d.c_colonia}`)}
    ${row('Municipio / Estado / CP', `${d.c_municipio||'—'} / ${d.c_estado||'—'} / ${d.c_cp||'—'}`)}
    ${row('Vivienda', d.c_vivienda)}
    ${row('Tiempo de residencia', d.c_residencia?`${d.c_residencia} años`:'—')}
    ${row('Email', d.c_email)}
    ${row('Cónyuge', `${d.c_conyuge||'—'} / ${d.c_conyuge_cel||'—'}`)}

    <div class="bar">Actividad económica (ingresos) — Cliente</div>
    ${row('Ocupación / Empresa', `${d.c_ocupacion||'—'} / ${d.c_empresa||'—'}`)}
    ${row('Dirección de empresa', d.c_empresa_dir)}
    ${row('Sueldo mensual', '$'+N(d.c_sueldo))}
    ${row('¿Comprueba ingresos?', d.c_comprueba)}
    ${row('Otros ingresos', '$'+N(d.c_otros_ing))}
    <div class="calc total"><span>Total de ingresos (cliente)</span><span>$${N(c.totalIng)}</span></div>

    <div class="grid2">
      <div>
        <div class="bar">Estudio de gastos básicos</div>
        ${row('Renta o hipoteca', '$'+N(d.c_g_renta))}
        ${row('Alimentos', '$'+N(d.c_g_alimentos))}
        ${row('Servicios (luz, agua, cable, tel.)', '$'+N(d.c_g_servicios))}
        ${row('Transporte', '$'+N(d.c_g_transporte))}
        ${row('Estudios (personal, hijos)', '$'+N(d.c_g_estudios))}
        ${row('Otros gastos', '$'+N(d.c_g_otros))}
        <div class="calc"><span>Total de gastos</span><span>$${N(c.totalGastos)}</span></div>
      </div>
      <div>
        <div class="bar gold">Capacidad de gastos</div>
        ${row('Ingresos mes 1', '$'+N(d.c_ing_m1))}
        ${row('Ingresos mes 2', '$'+N(d.c_ing_m2))}
        ${row('Ingresos mes 3', '$'+N(d.c_ing_m3))}
        <div class="calc"><span>Diferencia</span><span>$${N(c.diferencia)}</span></div>
        <div class="calc total"><span>Capacidad de pago semanal (÷4)</span><span>$${N(c.capacidadSemanal)}</span></div>
      </div>
    </div>

    <div class="bar">Monto y plazo</div>
    ${row('Monto solicitado', '$'+N(d.monto))}
    ${row('Plazo acordado', d.plazo?`${d.plazo} semanas`:'—')}
    ${row('Tipo de cliente', d.tipo_cliente)}
    ${productInfo.interestFactor?row('Total a pagar', '$'+(parseFloat(d.monto||0)*productInfo.interestFactor).toLocaleString()):''}

    <div class="bar">Datos del aval</div>
    ${row('Nombre completo', `${d.a_nombre} ${d.a_ap_paterno} ${d.a_ap_materno}`)}
    ${row('Fecha de nacimiento', d.a_dia&&d.a_mes&&d.a_anio ? `${d.a_dia}/${d.a_mes}/${d.a_anio}` : '—')}
    ${row('Sexo / Estado civil', `${d.a_sexo||'—'} / ${d.a_estado_civil||'—'}`)}
    ${row('Celular personal / referencia', `${d.a_cel_personal||'—'} / ${d.a_cel_ref||'—'}`)}
    ${row('Domicilio', `${d.a_domicilio}, ${d.a_colonia}`)}
    ${row('Municipio / Estado / CP', `${d.a_municipio||'—'} / ${d.a_estado||'—'} / ${d.a_cp||'—'}`)}
    ${row('Vivienda', d.a_vivienda)}
    ${row('Tiempo de residencia', d.a_residencia?`${d.a_residencia} años`:'—')}
    ${row('Email', d.a_email)}
    ${row('Cónyuge', d.a_conyuge)}

    <div class="bar">Actividad económica (ingresos) — Aval</div>
    ${row('Ocupación / Empresa', `${d.a_ocupacion||'—'} / ${d.a_empresa||'—'}`)}
    ${row('Dirección de empresa', d.a_empresa_dir)}
    ${row('Sueldo mensual', '$'+N(d.a_sueldo))}
    ${row('¿Comprueba ingresos?', d.a_comprueba)}
    ${row('Otros ingresos', '$'+N(d.a_otros_ing))}
    <div class="calc total"><span>Total de ingresos (aval)</span><span>$${N(a.totalIng)}</span></div>

    <div class="grid2">
      <div>
        <div class="bar">Estudio de gastos básicos — Aval</div>
        ${row('Renta o hipoteca', '$'+N(d.a_g_renta))}
        ${row('Alimentos', '$'+N(d.a_g_alimentos))}
        ${row('Servicios (luz, agua, cable, tel.)', '$'+N(d.a_g_servicios))}
        ${row('Transporte', '$'+N(d.a_g_transporte))}
        ${row('Estudios (personal, hijos)', '$'+N(d.a_g_estudios))}
        ${row('Otros gastos', '$'+N(d.a_g_otros))}
        <div class="calc"><span>Total de gastos</span><span>$${N(a.totalGastos)}</span></div>
      </div>
      <div>
        <div class="bar gold">Capacidad de gastos — Aval</div>
        ${row('Ingresos mes 1', '$'+N(d.a_ing_m1))}
        ${row('Ingresos mes 2', '$'+N(d.a_ing_m2))}
        ${row('Ingresos mes 3', '$'+N(d.a_ing_m3))}
        <div class="calc"><span>Diferencia</span><span>$${N(a.diferencia)}</span></div>
        <div class="calc total"><span>Capacidad de pago semanal (÷4)</span><span>$${N(a.capacidadSemanal)}</span></div>
      </div>
    </div>

    <div class="footer">
      <p>Documento generado automáticamente desde la plataforma CrediEfectivo</p>
      <p>Este documento es una solicitud de crédito y no constituye una aprobación</p>
      <p>© ${new Date().getFullYear()} CrediEfectivo - Todos los derechos reservados</p>
    </div>`;
}

// Documento completo (solo para la ventana de vista previa, vía document.write)
function generatePDFHTML(d){
  return `<html><head><meta charset="UTF-8"><title>Solicitud de Crédito - CrediEfectivo</title>
  <style>${PDF_CSS}</style></head>
  <body class="pdf-doc">${generatePDFBody(d)}</body></html>`;
}

async function generateAndSendPDF(){
  if(!validateForm()){
    Swal.fire({icon:'error', title:'Campos incompletos', text:'Completa los campos obligatorios marcados en rojo.', confirmButtonColor:'#e74c3c'});
    return;
  }
  const d = getFormData();
  Swal.fire({title:'Generando PDF...', allowOutsideClick:false, didOpen:()=>Swal.showLoading()});

  // Estilo temporal en el <head> del documento (un div no puede contener <style> de forma confiable
  // cuando se le asigna un documento HTML completo vía innerHTML; por eso se inyecta aparte)
  const styleEl = document.createElement('style');
  styleEl.id = 'pdf-temp-style';
  styleEl.textContent = PDF_CSS;
  document.head.appendChild(styleEl);

  // Contenedor temporal: fijo en la esquina superior, detrás de todo (z-index negativo)
  // y con ancho explícito. Posicionarlo muy lejos con "left:-9999px" es lo que causaba
  // que html2canvas capturara un lienzo vacío.
  const tempDiv = document.createElement('div');
  tempDiv.className = 'pdf-doc';
  tempDiv.innerHTML = generatePDFBody(d);
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '0';
  tempDiv.style.left = '0';
  tempDiv.style.zIndex = '-9999';
  tempDiv.style.width = '794px'; // ancho aproximado de A4 a 96dpi
  document.body.appendChild(tempDiv);

  try{
    const opt = {
      margin:[10,10,10,10],
      filename:`Solicitud_Credito_${(d.c_nombre+'_'+d.c_ap_paterno).replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`,
      image:{type:'jpeg', quality:0.98},
      html2canvas:{scale:2, useCORS:true, backgroundColor:'#ffffff', windowWidth:794},
      jsPDF:{unit:'mm', format:'a4', orientation:'portrait'}
    };
    await html2pdf().set(opt).from(tempDiv).save();
    document.body.removeChild(tempDiv);
    styleEl.remove();
    Swal.close();

    const c = totals(d,'c');
    const message = `📋 *NUEVA SOLICITUD DE CRÉDITO - CrediEfectivo*

*CLIENTE:* ${d.c_nombre} ${d.c_ap_paterno} ${d.c_ap_materno}
• Celular: ${d.c_cel_personal}
• Sueldo mensual: $${parseFloat(d.c_sueldo||0).toLocaleString()}
• Capacidad de pago semanal: $${Math.round(c.capacidadSemanal).toLocaleString()}

*AVAL:* ${d.a_nombre} ${d.a_ap_paterno} ${d.a_ap_materno}
• Celular: ${d.a_cel_personal}

*CRÉDITO:*
• Producto: ${products[d.producto]?.name||'N/A'}
• Monto: $${parseFloat(d.monto||0).toLocaleString()}
• Plazo: ${d.plazo||'—'} semanas

---
*Adjunta el PDF descargado.*`;

    window.open(`https://wa.me/522207863287?text=${encodeURIComponent(message)}`, '_blank');

    await Swal.fire({icon:'success', title:'¡Solicitud generada!', html:'<p>El PDF se descargó correctamente.</p><p>Se abrirá WhatsApp; adjunta el PDF en el chat.</p>', confirmButtonColor:'#25D366'});
    document.getElementById('credit-form').reset();
    updateCalc();
  }catch(err){
    console.error(err);
    if(tempDiv.parentNode) document.body.removeChild(tempDiv);
    if(styleEl.parentNode) styleEl.remove();
    Swal.fire({icon:'error', title:'Error al generar el PDF', confirmButtonColor:'#e74c3c'});
  }
}

document.getElementById('preview-btn').addEventListener('click', function(){
  if(!validateForm()){
    Swal.fire({icon:'warning', title:'Información incompleta', confirmButtonColor:'#e74c3c'});
    return;
  }
  const win = window.open('', '_blank');
  win.document.write(generatePDFHTML(getFormData()));
  win.document.close(); win.focus();
});

document.getElementById('credit-form').addEventListener('submit', async e=>{ e.preventDefault(); await generateAndSendPDF(); });

document.querySelectorAll('.form-control').forEach(input=>{
  input.addEventListener('blur', function(){
    const errorMsg = this.closest('.form-group')?.querySelector('.error-message');
    if(this.hasAttribute('required') && (!this.value || this.value.trim()==='')){
      this.classList.add('error'); if(errorMsg) errorMsg.classList.add('show');
    } else { this.classList.remove('error'); if(errorMsg) errorMsg.classList.remove('show'); }
  });
});
