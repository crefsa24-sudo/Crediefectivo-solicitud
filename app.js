/* ============ CONFIGURACIÓN ============ */
const products = {
  'semanal-15': {name:'Crédito Semanal 15 semanas', interestFactor:1.425, term:15, termType:'semanas', minAmount:5000, maxAmount:15000},
  'semanal-31': {name:'Crédito Semanal 31 semanas', interestFactor:1.55, term:31, termType:'semanas', minAmount:5000, maxAmount:15000},
  'diario-21':  {name:'Crédito Diario 21 días', interestFactor:1.554, term:21, termType:'días', minAmount:1000, maxAmount:4000}
};

const WHATSAPP_NUMBER = '522207863287';

/* ============ UTILIDADES ============ */
function v(id){ const el=document.getElementById(id); return el?el.value:''; }
function radioVal(name){ const el=document.querySelector(`input[name="${name}"]:checked`); return el?el.value:''; }
function fmt(n){ return '$'+(Math.round((n||0)*100)/100).toLocaleString('es-MX'); }
function N(x){ return parseFloat(x||0); }
function S(n){ return '$'+Math.round(n||0).toLocaleString('es-MX'); }

function getFormData(){
  const ids = [
    'fecha','ejecutivo','zona','producto',
    'c_nombre','c_ap_paterno','c_ap_materno','c_dia','c_mes','c_anio','c_sexo','c_estado_civil',
    'c_cel_personal','c_cel_ref','c_curp','c_domicilio','c_colonia','c_municipio','c_estado','c_cp',
    'c_residencia','c_email','c_conyuge','c_conyuge_cel','c_ocupacion','c_empresa','c_empresa_dir',
    'c_sueldo','c_otros_ing','c_g_renta','c_g_alimentos','c_g_servicios','c_g_transporte','c_g_estudios','c_g_otros',
    'c_ing_m1','c_ing_m2','c_ing_m3','monto','plazo',
    'a_nombre','a_ap_paterno','a_ap_materno','a_dia','a_mes','a_anio','a_sexo','a_estado_civil',
    'a_cel_personal','a_cel_ref','a_email','a_domicilio','a_colonia','a_municipio','a_estado','a_cp',
    'a_residencia','a_conyuge','a_ocupacion','a_empresa','a_empresa_dir',
    'a_sueldo','a_otros_ing','a_g_renta','a_g_alimentos','a_g_servicios','a_g_transporte','a_g_estudios','a_g_otros',
    'a_ing_m1','a_ing_m2','a_ing_m3'
  ];
  const d = {};
  ids.forEach(id=> d[id]=v(id));
  d.c_vivienda = radioVal('c_vivienda');
  d.c_comprueba = radioVal('c_comprueba');
  d.a_vivienda = radioVal('a_vivienda');
  d.a_comprueba = radioVal('a_comprueba');
  d.tipo_cliente = radioVal('tipo_cliente');
  return d;
}

function totals(d, p){
  const totalIng = N(d[`${p}_sueldo`]) + N(d[`${p}_otros_ing`]);
  const totalGastos = ['renta','alimentos','servicios','transporte','estudios','otros']
    .reduce((s,k)=> s + N(d[`${p}_g_${k}`]), 0);
  const meses = [d[`${p}_ing_m1`], d[`${p}_ing_m2`], d[`${p}_ing_m3`]].map(x=>N(x));
  const mesesConDato = meses.filter(x=>x>0);
  const promedioMensual = mesesConDato.length ? meses.reduce((a,b)=>a+b,0)/mesesConDato.length : totalIng;
  const diferencia = promedioMensual - totalGastos;
  const capacidadSemanal = diferencia / 4;
  return {totalIng, totalGastos, diferencia, capacidadSemanal, promedioMensual};
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

/* ============ VALIDACIÓN ============ */
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

document.querySelectorAll('.form-control').forEach(input=>{
  input.addEventListener('blur', function(){
    const errorMsg = this.closest('.form-group')?.querySelector('.error-message');
    if(this.hasAttribute('required') && (!this.value || this.value.trim()==='')){
      this.classList.add('error'); if(errorMsg) errorMsg.classList.add('show');
    } else { this.classList.remove('error'); if(errorMsg) errorMsg.classList.remove('show'); }
  });
});

/* ============ GENERAR HTML DEL PDF (FORMATO CUADRÍCULA LETTER) ============ */
function generatePDFHTML(d){
  const c = totals(d,'c');
  const a = totals(d,'a');
  const prod = products[d.producto] || {name:'No seleccionado', interestFactor:0, term:0};
  const folio = 'CRED-'+String(Math.floor(Math.random()*1000000)).padStart(6,'0');
  const chk = (val, expected) => val===expected ? 'checked' : '';

  return `
  <div id="pdf-content" style="font-family:Arial,Helvetica,sans-serif;font-size:6.5px;color:#000;width:816px;margin:0 auto;background:#fff;padding:0;box-sizing:border-box;line-height:1.05;">
  <style>
    #pdf-content * { box-sizing:border-box; margin:0; padding:0; }
    #pdf-content table { width:100%; border-collapse:collapse; table-layout:fixed; }
    #pdf-content td { border:0.8px solid #000; padding:1px 3px; vertical-align:middle; font-size:6.5px; line-height:1.1; }
    #pdf-content .hc { background:#1a1a1a; color:#fff; font-weight:bold; font-size:7px; text-transform:uppercase; letter-spacing:0.02em; padding:1px 3px; }
    #pdf-content .tc { background:#c8a13a; color:#1c1c1c; font-weight:bold; font-size:7px; text-transform:uppercase; padding:1px 3px; }
    #pdf-content .lb { background:#f0f0f0; font-weight:bold; font-size:6px; white-space:nowrap; }
    #pdf-content .vl { font-size:6.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #pdf-content .bt { font-size:10px; font-weight:900; letter-spacing:0.5px; }
    #pdf-content .st { font-size:5.5px; color:#555; letter-spacing:0.12em; }
    #pdf-content .hl { background:#eaf5ee; font-weight:bold; color:#1f8a5f; }
    #pdf-content .ck { display:inline-block; width:6px; height:6px; border:0.6px solid #000; margin:0 1px; vertical-align:middle; position:relative; top:-0.5px; }
    #pdf-content .ckd { background:#000; }
    #pdf-content .sg { background:#c8a13a; color:#1c1c1c; font-weight:bold; }
    #pdf-content .sgl { background:#c8a13a; color:#1c1c1c; font-weight:bold; font-size:6px; }
    #pdf-content .ft { text-align:center; font-size:5.5px; color:#666; padding-top:1px; }
    #pdf-content .sgn { border-top:0.6px solid #000; width:70%; margin:0 auto; padding-top:1px; font-size:6px; }
  </style>

  <!-- ENCABEZADO -->
  <table>
    <tr>
      <td rowspan="2" style="width:26%; text-align:center; vertical-align:middle;">
        <div class="bt">CREDIEFECTIVO</div>
        <div class="st">CASH LOAN FINANCIAL</div>
      </td>
      <td class="tc" style="width:10%;">FECHA</td>
      <td class="vl" style="width:18%;">${d.fecha||''}</td>
      <td class="tc" style="width:12%;">EJECUTIVO</td>
      <td class="vl" style="width:34%;" colspan="2">${d.ejecutivo||''}</td>
    </tr>
    <tr>
      <td class="tc">ZONA</td>
      <td class="vl">${d.zona||''}</td>
      <td class="tc">PRODUCTO</td>
      <td class="vl" colspan="2">${prod.name}</td>
    </tr>
  </table>

  <!-- DATOS DEL CLIENTE -->
  <table style="margin-top:1px;">
    <tr><td colspan="6" class="hc">DATOS DEL CLIENTE</td></tr>
    <tr>
      <td class="lb" style="width:13%;">APELLIDO PATERNO:</td><td class="vl" style="width:20%;">${d.c_ap_paterno||''}</td>
      <td class="lb" style="width:13%;">APELLIDO MATERNO:</td><td class="vl" style="width:20%;">${d.c_ap_materno||''}</td>
      <td class="lb" style="width:12%;">NOMBRE(S):</td><td class="vl" style="width:22%;">${d.c_nombre||''}</td>
    </tr>
    <tr>
      <td class="lb">FECHA NAC.:</td>
      <td class="vl">D:${d.c_dia||''} M:${d.c_mes||''} A:${d.c_anio||''}</td>
      <td class="lb">SEXO:</td><td class="vl">${d.c_sexo||''}</td>
      <td class="lb">EDO. CIVIL:</td><td class="vl">${d.c_estado_civil||''}</td>
    </tr>
    <tr>
      <td class="lb">CEL. PERSONAL:</td><td class="vl">${d.c_cel_personal||''}</td>
      <td class="lb">CEL. REF.:</td><td class="vl">${d.c_cel_ref||''}</td>
      <td class="lb">CURP:</td><td class="vl">${d.c_curp||''}</td>
    </tr>
    <tr>
      <td class="lb">DOMICILIO:</td><td class="vl" colspan="3">${d.c_domicilio||''}${d.c_colonia?', '+d.c_colonia:''}</td>
      <td class="lb">MUNICIPIO:</td><td class="vl">${d.c_municipio||''}</td>
    </tr>
    <tr>
      <td class="lb">ESTADO:</td><td class="vl">${d.c_estado||''}</td>
      <td class="lb">C.P.:</td><td class="vl">${d.c_cp||''}</td>
      <td class="lb">EMAIL:</td><td class="vl">${d.c_email||''}</td>
    </tr>
    <tr>
      <td class="lb">VIVIENDA:</td>
      <td class="vl">Propia<span class="ck ${chk(d.c_vivienda,'Propia')}"></span> Rentada<span class="ck ${chk(d.c_vivienda,'Rentada')}"></span> Familiares<span class="ck ${chk(d.c_vivienda,'Familiares')}"></span></td>
      <td class="lb">RESIDENCIA:</td><td class="vl">${d.c_residencia?d.c_residencia+' años':''}</td>
      <td class="lb">CÓNYUGE:</td><td class="vl">${d.c_conyuge||''}${d.c_conyuge_cel?' / '+d.c_conyuge_cel:''}</td>
    </tr>
  </table>

  <!-- ACTIVIDAD ECONÓMICA CLIENTE -->
  <table style="margin-top:1px;">
    <tr><td colspan="6" class="hc">ACTIVIDAD ECONÓMICA (INGRESOS) — CLIENTE</td></tr>
    <tr>
      <td class="lb" style="width:12%;">OCUPACIÓN:</td><td class="vl" style="width:21%;">${d.c_ocupacion||''}</td>
      <td class="lb" style="width:12%;">EMPRESA:</td><td class="vl" style="width:21%;">${d.c_empresa||''}</td>
      <td class="lb" style="width:12%;">DIRECCIÓN:</td><td class="vl" style="width:22%;">${d.c_empresa_dir||''}</td>
    </tr>
    <tr>
      <td class="lb">SUELDO MENSUAL:</td><td class="vl">${S(d.c_sueldo)}</td>
      <td class="lb">COMPRUEBA:</td>
      <td class="vl">SÍ<span class="ck ${chk(d.c_comprueba,'Sí')}"></span> NO<span class="ck ${chk(d.c_comprueba,'No')}"></span></td>
      <td class="lb">OTROS ING.:</td><td class="vl">${S(d.c_otros_ing)}</td>
    </tr>
    <tr>
      <td colspan="2" class="hl" style="text-align:right;">TOTAL INGRESOS CLIENTE</td>
      <td colspan="4" class="hl">${S(c.totalIng)}</td>
    </tr>
  </table>

  <!-- GASTOS Y CAPACIDAD CLIENTE -->
  <table style="margin-top:1px;">
    <tr>
      <td colspan="3" class="hc">ESTUDIO DE GASTOS BÁSICOS (EGRESOS)</td>
      <td colspan="3" class="tc">CAPACIDAD DE GASTOS</td>
    </tr>
    <tr>
      <td class="lb" style="width:22%;">RENTA / HIPOTECA:</td><td class="vl" style="width:11%;">${S(d.c_g_renta)}</td><td style="width:6%; border:none;"></td>
      <td class="lb" style="width:18%;">ING. MES 1:</td><td class="vl" style="width:14%;">${S(d.c_ing_m1)}</td><td style="width:29%;"></td>
    </tr>
    <tr>
      <td class="lb">ALIMENTOS:</td><td class="vl">${S(d.c_g_alimentos)}</td><td style="border:none;"></td>
      <td class="lb">ING. MES 2:</td><td class="vl">${S(d.c_ing_m2)}</td><td></td>
    </tr>
    <tr>
      <td class="lb">SERVICIOS:</td><td class="vl">${S(d.c_g_servicios)}</td><td style="border:none;"></td>
      <td class="lb">ING. MES 3:</td><td class="vl">${S(d.c_ing_m3)}</td><td></td>
    </tr>
    <tr>
      <td class="lb">TRANSPORTE:</td><td class="vl">${S(d.c_g_transporte)}</td><td style="border:none;"></td>
      <td class="lb">DIFERENCIA:</td><td class="vl">${S(c.diferencia)}</td><td></td>
    </tr>
    <tr>
      <td class="lb">ESTUDIOS:</td><td class="vl">${S(d.c_g_estudios)}</td><td style="border:none;"></td>
      <td rowspan="2" class="sgl">CAP. PAGO SEMANAL (÷4)</td>
      <td rowspan="2" class="sg" colspan="2">${S(c.capacidadSemanal)}</td>
    </tr>
    <tr>
      <td class="lb">OTROS GASTOS:</td><td class="vl">${S(d.c_g_otros)}</td><td style="border:none;"></td>
    </tr>
    <tr>
      <td class="lb">TOTAL GASTOS:</td>
      <td class="vl" style="font-weight:bold;">${S(c.totalGastos)}</td>
      <td style="border:none;"></td>
      <td colspan="3"></td>
    </tr>
  </table>

  <!-- MONTO Y PLAZO -->
  <table style="margin-top:1px;">
    <tr><td colspan="6" class="hc">MONTO Y PLAZO</td></tr>
    <tr>
      <td class="lb" style="width:16%;">MONTO SOLICITADO:</td><td class="vl" style="width:17%;">${S(d.monto)}</td>
      <td class="lb" style="width:14%;">PLAZO:</td><td class="vl" style="width:17%;">${d.plazo||''} semanas</td>
      <td class="lb" style="width:14%;">TIPO CLIENTE:</td>
      <td class="vl" style="width:22%;">Nuevo<span class="ck ${chk(d.tipo_cliente,'Cliente nuevo')}"></span> Renov.<span class="ck ${chk(d.tipo_cliente,'Renovación')}"></span></td>
    </tr>
    <tr>
      <td class="lb">TOTAL A PAGAR:</td><td class="vl">${S(N(d.monto)*prod.interestFactor)}</td>
      <td class="lb">FOLIO:</td><td class="vl" colspan="3">${folio}</td>
    </tr>
  </table>

  <!-- DATOS DEL AVAL -->
  <table style="margin-top:1px;">
    <tr><td colspan="6" class="hc">DATOS DEL AVAL</td></tr>
    <tr>
      <td class="lb" style="width:13%;">APELLIDO PATERNO:</td><td class="vl" style="width:20%;">${d.a_ap_paterno||''}</td>
      <td class="lb" style="width:13%;">APELLIDO MATERNO:</td><td class="vl" style="width:20%;">${d.a_ap_materno||''}</td>
      <td class="lb" style="width:12%;">NOMBRE(S):</td><td class="vl" style="width:22%;">${d.a_nombre||''}</td>
    </tr>
    <tr>
      <td class="lb">FECHA NAC.:</td>
      <td class="vl">D:${d.a_dia||''} M:${d.a_mes||''} A:${d.a_anio||''}</td>
      <td class="lb">SEXO:</td><td class="vl">${d.a_sexo||''}</td>
      <td class="lb">EDO. CIVIL:</td><td class="vl">${d.a_estado_civil||''}</td>
    </tr>
    <tr>
      <td class="lb">CEL. PERSONAL:</td><td class="vl">${d.a_cel_personal||''}</td>
      <td class="lb">CEL. REF.:</td><td class="vl">${d.a_cel_ref||''}</td>
      <td class="lb">EMAIL:</td><td class="vl">${d.a_email||''}</td>
    </tr>
    <tr>
      <td class="lb">DOMICILIO:</td><td class="vl" colspan="3">${d.a_domicilio||''}${d.a_colonia?', '+d.a_colonia:''}</td>
      <td class="lb">MUNICIPIO:</td><td class="vl">${d.a_municipio||''}</td>
    </tr>
    <tr>
      <td class="lb">ESTADO:</td><td class="vl">${d.a_estado||''}</td>
      <td class="lb">C.P.:</td><td class="vl">${d.a_cp||''}</td>
      <td class="lb">CÓNYUGE:</td><td class="vl">${d.a_conyuge||''}</td>
    </tr>
    <tr>
      <td class="lb">VIVIENDA:</td>
      <td class="vl">Propia<span class="ck ${chk(d.a_vivienda,'Propia')}"></span> Rentada<span class="ck ${chk(d.a_vivienda,'Rentada')}"></span> Familiares<span class="ck ${chk(d.a_vivienda,'Familiares')}"></span></td>
      <td class="lb">RESIDENCIA:</td><td class="vl">${d.a_residencia?d.a_residencia+' años':''}</td>
      <td colspan="2"></td>
    </tr>
  </table>

  <!-- ACTIVIDAD ECONÓMICA AVAL -->
  <table style="margin-top:1px;">
    <tr><td colspan="6" class="hc">ACTIVIDAD ECONÓMICA (INGRESOS) — AVAL</td></tr>
    <tr>
      <td class="lb" style="width:12%;">OCUPACIÓN:</td><td class="vl" style="width:21%;">${d.a_ocupacion||''}</td>
      <td class="lb" style="width:12%;">EMPRESA:</td><td class="vl" style="width:21%;">${d.a_empresa||''}</td>
      <td class="lb" style="width:12%;">DIRECCIÓN:</td><td class="vl" style="width:22%;">${d.a_empresa_dir||''}</td>
    </tr>
    <tr>
      <td class="lb">SUELDO MENSUAL:</td><td class="vl">${S(d.a_sueldo)}</td>
      <td class="lb">COMPRUEBA:</td>
      <td class="vl">SÍ<span class="ck ${chk(d.a_comprueba,'Sí')}"></span> NO<span class="ck ${chk(d.a_comprueba,'No')}"></span></td>
      <td class="lb">OTROS ING.:</td><td class="vl">${S(d.a_otros_ing)}</td>
    </tr>
    <tr>
      <td colspan="2" class="hl" style="text-align:right;">TOTAL INGRESOS AVAL</td>
      <td colspan="4" class="hl">${S(a.totalIng)}</td>
    </tr>
  </table>

  <!-- GASTOS Y CAPACIDAD AVAL -->
  <table style="margin-top:1px;">
    <tr>
      <td colspan="3" class="hc">ESTUDIO DE GASTOS BÁSICOS — AVAL</td>
      <td colspan="3" class="tc">CAPACIDAD DE GASTOS — AVAL</td>
    </tr>
    <tr>
      <td class="lb" style="width:22%;">RENTA / HIPOTECA:</td><td class="vl" style="width:11%;">${S(d.a_g_renta)}</td><td style="width:6%; border:none;"></td>
      <td class="lb" style="width:18%;">ING. MES 1:</td><td class="vl" style="width:14%;">${S(d.a_ing_m1)}</td><td style="width:29%;"></td>
    </tr>
    <tr>
      <td class="lb">ALIMENTOS:</td><td class="vl">${S(d.a_g_alimentos)}</td><td style="border:none;"></td>
      <td class="lb">ING. MES 2:</td><td class="vl">${S(d.a_ing_m2)}</td><td></td>
    </tr>
    <tr>
      <td class="lb">SERVICIOS:</td><td class="vl">${S(d.a_g_servicios)}</td><td style="border:none;"></td>
      <td class="lb">ING. MES 3:</td><td class="vl">${S(d.a_ing_m3)}</td><td></td>
    </tr>
    <tr>
      <td class="lb">TRANSPORTE:</td><td class="vl">${S(d.a_g_transporte)}</td><td style="border:none;"></td>
      <td class="lb">DIFERENCIA:</td><td class="vl">${S(a.diferencia)}</td><td></td>
    </tr>
    <tr>
      <td class="lb">ESTUDIOS:</td><td class="vl">${S(d.a_g_estudios)}</td><td style="border:none;"></td>
      <td rowspan="2" class="sgl">CAP. PAGO SEMANAL (÷4)</td>
      <td rowspan="2" class="sg" colspan="2">${S(a.capacidadSemanal)}</td>
    </tr>
    <tr>
      <td class="lb">OTROS GASTOS:</td><td class="vl">${S(d.a_g_otros)}</td><td style="border:none;"></td>
    </tr>
    <tr>
      <td class="lb">TOTAL GASTOS:</td>
      <td class="vl" style="font-weight:bold;">${S(a.totalGastos)}</td>
      <td style="border:none;"></td>
      <td colspan="3"></td>
    </tr>
  </table>

  <!-- FIRMAS -->
  <table style="margin-top:1px;">
    <tr>
      <td style="width:50%; height:22px; vertical-align:bottom; text-align:center; border:none;">
        <div class="sgn">FIRMA DEL CLIENTE</div>
      </td>
      <td style="width:50%; height:22px; vertical-align:bottom; text-align:center; border:none;">
        <div class="sgn">FIRMA DEL AVAL</div>
      </td>
    </tr>
  </table>

  <div class="ft">
    Documento generado automáticamente — CrediEfectivo © ${new Date().getFullYear()} — Folio: ${folio}
  </div>
  </div>`;
}

/* ============ GENERAR PDF (html2canvas + jsPDF) UNA SOLA HOJA LETTER ============ */
async function generatePDF(){
  const d = getFormData();
  const container = document.getElementById('pdf-container');
  container.innerHTML = generatePDFHTML(d);

  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.opacity = '0';
  container.style.zIndex = '-1';
  container.style.width = '816px';

  await new Promise(r=>setTimeout(r, 500));

  const element = document.getElementById('pdf-content');
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 816,
    height: element.scrollHeight
  });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'letter');

  const pageWidth = 216;
  const pageHeight = 279;
  const margin = 4;
  const usableWidth = pageWidth - (margin * 2);
  const usableHeight = pageHeight - (margin * 2);

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pxToMm = 25.4 / 96;
  const imgWidthMm = imgWidth * pxToMm;
  const imgHeightMm = imgHeight * pxToMm;

  const scaleX = usableWidth / imgWidthMm;
  const scaleY = usableHeight / imgHeightMm;
  const scale = Math.min(scaleX, scaleY, 1);

  const finalWidth = imgWidthMm * scale;
  const finalHeight = imgHeightMm * scale;

  const xOffset = margin + (usableWidth - finalWidth) / 2;
  const yOffset = margin + (usableHeight - finalHeight) / 2;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

  const fileName = `Solicitud_Credito_${(d.c_nombre+'_'+d.c_ap_paterno).replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`;
  pdf.save(fileName);

  container.innerHTML = '';
  container.style.position = 'fixed';
  container.style.left = '-10000px';

  return {fileName, d};
}

/* ============ VISTA PREVIA ============ */
document.getElementById('preview-btn').addEventListener('click', function(){
  if(!validateForm()){
    Swal.fire({icon:'warning', title:'Información incompleta', text:'Completa los campos obligatorios.', confirmButtonColor:'#e74c3c'});
    return;
  }
  const d = getFormData();
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vista previa</title></head><body style="margin:0; background:#eee; padding:10px;">`);
  win.document.write(generatePDFHTML(d));
  win.document.write(`</body></html>`);
  win.document.close();
});

/* ============ GENERAR Y ENVIAR ============ */
document.getElementById('credit-form').addEventListener('submit', async e=>{
  e.preventDefault();
  if(!validateForm()){
    Swal.fire({icon:'error', title:'Campos incompletos', text:'Completa los campos obligatorios marcados en rojo.', confirmButtonColor:'#e74c3c'});
    return;
  }

  Swal.fire({title:'Generando PDF...', allowOutsideClick:false, didOpen:()=>Swal.showLoading()});

  try{
    const {d} = await generatePDF();
    const c = totals(d,'c');
    const prod = products[d.producto] || {name:'N/A'};

    Swal.close();

    const message = `📋 *NUEVA SOLICITUD DE CRÉDITO - CrediEfectivo*

*CLIENTE:* ${d.c_nombre} ${d.c_ap_paterno} ${d.c_ap_materno}
• Celular: ${d.c_cel_personal}
• Sueldo mensual: ${S(N(d.c_sueldo))}
• Capacidad de pago semanal: ${S(Math.round(c.capacidadSemanal))}

*AVAL:* ${d.a_nombre} ${d.a_ap_paterno} ${d.a_ap_materno}
• Celular: ${d.a_cel_personal}

*CRÉDITO:*
• Producto: ${prod.name}
• Monto: ${S(N(d.monto))}
• Plazo: ${d.plazo||'—'} semanas

📎 *Adjunta el PDF descargado en este chat.*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    await Swal.fire({
      icon:'success',
      title:'¡Solicitud generada!',
      html:'<p>✅ El PDF se descargó correctamente.</p><p>📱 Se abrió WhatsApp; <b>adjunta el PDF</b> en el chat.</p>',
      confirmButtonColor:'#25D366'
    });

  }catch(err){
    console.error(err);
    Swal.fire({icon:'error', title:'Error al generar el PDF', text: err.message, confirmButtonColor:'#e74c3c'});
  }
});

/* ============ EXCEL ============ */
document.getElementById('excel-btn').addEventListener('click', function(){
  if(!validateForm()){
    Swal.fire({icon:'warning', title:'Información incompleta', text:'Completa los campos obligatorios para generar el Excel.', confirmButtonColor:'#e74c3c'});
    return;
  }

  const d = getFormData();
  const c = totals(d,'c');
  const a = totals(d,'a');
  const prod = products[d.producto] || {name:'N/A'};
  const folio = 'CRED-'+String(Math.floor(Math.random()*1000000)).padStart(6,'0');

  const ws_data = [
    ['CREDIEFECTIVO - SOLICITUD DE CRÉDITO', '', '', '', '', '', '', '', '', '', '', ''],
    ['CASH LOAN FINANCIAL', '', '', '', '', '', '', '', '', '', '', ''],
    [''],
    ['FOLIO:', folio, 'FECHA:', d.fecha, 'EJECUTIVO:', d.ejecutivo, '', 'ZONA:', d.zona, '', 'PRODUCTO:', prod.name],
    [''],
    ['DATOS DEL CLIENTE', '', '', '', '', '', '', '', '', '', '', ''],
    ['APELLIDO PATERNO:', d.c_ap_paterno, 'APELLIDO MATERNO:', d.c_ap_materno, '', 'NOMBRE(S):', d.c_nombre, '', '', '', '', ''],
    ['FECHA NAC:', `${d.c_dia||''}/${d.c_mes||''}/${d.c_anio||''}`, 'SEXO:', d.c_sexo, 'ESTADO CIVIL:', d.c_estado_civil, 'CELULAR:', d.c_cel_personal, 'REFERENCIA:', d.c_cel_ref, 'CURP:', d.c_curp],
    ['DOMICILIO:', d.c_domicilio, '', 'COLONIA:', d.c_colonia, '', 'MUNICIPIO:', d.c_municipio, 'ESTADO:', d.c_estado, 'CP:', d.c_cp],
    ['VIVIENDA:', d.c_vivienda, 'RESIDENCIA:', d.c_residencia+' años', 'EMAIL:', d.c_email, 'CÓNYUGE:', d.c_conyuge, 'CEL CÓNYUGE:', d.c_conyuge_cel, '', '', ''],
    [''],
    ['ACTIVIDAD ECONÓMICA - CLIENTE', '', '', '', '', '', '', '', '', '', '', ''],
    ['OCUPACIÓN:', d.c_ocupacion, 'EMPRESA:', d.c_empresa, '', 'DIRECCIÓN:', d.c_empresa_dir, '', '', '', '', ''],
    ['SUELDO MENSUAL:', N(d.c_sueldo), 'COMPRUEBA:', d.c_comprueba, 'OTROS INGRESOS:', N(d.c_otros_ing), 'TOTAL INGRESOS:', c.totalIng, '', '', '', ''],
    ['RENTA/HIPOTECA:', N(d.c_g_renta), 'ALIMENTOS:', N(d.c_g_alimentos), 'SERVICIOS:', N(d.c_g_servicios), 'TRANSPORTE:', N(d.c_g_transporte), 'ESTUDIOS:', N(d.c_g_estudios), 'OTROS:', N(d.c_g_otros)],
    ['TOTAL GASTOS:', c.totalGastos, 'ING MES 1:', N(d.c_ing_m1), 'ING MES 2:', N(d.c_ing_m2), 'ING MES 3:', N(d.c_ing_m3), 'DIFERENCIA:', c.diferencia, 'CAP SEMANAL:', c.capacidadSemanal],
    [''],
    ['MONTO Y PLAZO', '', '', '', '', '', '', '', '', '', '', ''],
    ['MONTO SOLICITADO:', N(d.monto), 'PLAZO:', d.plazo+' semanas', 'TIPO CLIENTE:', d.tipo_cliente, 'TOTAL A PAGAR:', N(d.monto)*prod.interestFactor, '', '', '', ''],
    [''],
    ['DATOS DEL AVAL', '', '', '', '', '', '', '', '', '', '', ''],
    ['APELLIDO PATERNO:', d.a_ap_paterno, 'APELLIDO MATERNO:', d.a_ap_materno, '', 'NOMBRE(S):', d.a_nombre, '', '', '', '', ''],
    ['FECHA NAC:', `${d.a_dia||''}/${d.a_mes||''}/${d.a_anio||''}`, 'SEXO:', d.a_sexo, 'ESTADO CIVIL:', d.a_estado_civil, 'CELULAR:', d.a_cel_personal, 'REFERENCIA:', d.a_cel_ref, 'EMAIL:', d.a_email],
    ['DOMICILIO:', d.a_domicilio, '', 'COLONIA:', d.a_colonia, '', 'MUNICIPIO:', d.a_municipio, 'ESTADO:', d.a_estado, 'CP:', d.a_cp],
    ['VIVIENDA:', d.a_vivienda, 'RESIDENCIA:', d.a_residencia+' años', 'CÓNYUGE:', d.a_conyuge, '', '', '', '', '', ''],
    [''],
   
