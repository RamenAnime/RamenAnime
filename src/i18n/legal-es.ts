import type { LegalDocumentContent } from "./legal-types";

export const privacy: LegalDocumentContent = {
  quickSummaryTitle: "Resumen rápido",
  quickSummaryBody:
    "Recopilamos únicamente los datos mínimos necesarios para operar nuestros Servicios. No vendemos sus datos personales. Utilizamos cifrado conforme a los estándares del sector. Usted tiene derecho a acceder, rectificar y eliminar sus datos. Conservamos los datos como máximo {{dataRetentionDays}} días.",
  lastUpdated: "2 de mayo de 2025",
  sections: [
    {
      id: "privacy-1",
      title: "1. Introducción y ámbito de aplicación",
      paragraphs: [
        'Esta Política de Privacidad describe cómo Ramen Anime ("nosotros", "nos" o "nuestro") recopila, utiliza, almacena, comparte y protege su información personal cuando utiliza nuestro sitio web, aplicaciones móviles, mercado, foro social y servicios relacionados (en conjunto, los "Servicios").',
        "Esta Política cumple con {{privacyLaw}} y se aplica a todos los usuarios en todo el mundo. Según su ubicación, puede tener derechos adicionales descritos en la Sección 10.",
        "Al utilizar nuestros Servicios, usted consiente las prácticas descritas en esta Política. Si no está de acuerdo, no utilice los Servicios.",
      ],
    },
    {
      id: "privacy-2",
      title: "2. Información que recopilamos",
      paragraphs: [
        "<p><strong>2.1 Información que usted proporciona directamente:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Información de la cuenta:</strong> Nombre de usuario, dirección de correo electrónico, contraseña (almacenada como hash bcrypt con factor de coste 12)</li><li><strong>Información del perfil:</strong> Nombre para mostrar, biografía, avatar, ubicación, intereses (todos opcionales)</li><li><strong>Información del mercado:</strong> Direcciones de envío, tokens de métodos de pago (procesados por Stripe/PayPal; nunca almacenamos números completos de tarjeta)</li><li><strong>Contenido del foro:</strong> Publicaciones, comentarios y mensajes que usted crea</li><li><strong>Comunicaciones:</strong> Consultas de atención al cliente, comentarios</li><li><strong>Verificación de edad:</strong> Confirmación de edad, verificación opcional de identidad para contenido con restricción de edad</li></ul>',
        "<p><strong>2.2 Información recopilada automáticamente:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Información del dispositivo:</strong> Dirección IP, tipo de navegador, sistema operativo, identificadores del dispositivo</li><li><strong>Datos de uso:</strong> Páginas visitadas, funciones utilizadas, tiempo de permanencia, patrones de clics</li><li><strong>Geolocalización:</strong> País derivado de la dirección IP para cumplimiento normativo (cálculo del IVA, verificación de edad, controles de exportación)</li><li><strong>Cookies y tecnologías similares:</strong> Véase la Sección 8 (Política de cookies)</li></ul>',
        "<p><strong>2.3 Información de terceros:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li>Procesadores de pago (Stripe, PayPal): confirmación de transacción, últimos 4 dígitos de la tarjeta</li><li>Servicios de autenticación (si utiliza OAuth)</li><li>Servicios de prevención del fraude</li></ul>',
      ],
    },
    {
      id: "privacy-3",
      title: "3. Cómo utilizamos su información",
      paragraphs: [
        "Utilizamos sus datos personales para los siguientes fines:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Finalidad</th><th class="text-left py-2">Base jurídica (RGPD)</th><th class="text-left py-2">Datos utilizados</th></tr></thead><tbody class="space-y-2"><tr class="border-b border-border/50"><td class="py-2">Creación y gestión de la cuenta</td><td>Ejecución del contrato</td><td>Nombre de usuario, correo electrónico, hash de contraseña</td></tr><tr class="border-b border-border/50"><td class="py-2">Prestación del servicio</td><td>Ejecución del contrato</td><td>Datos del perfil, publicaciones del foro, preferencias</td></tr><tr class="border-b border-border/50"><td class="py-2">Procesamiento de pagos</td><td>Ejecución del contrato</td><td>Tokens de pago, historial de transacciones</td></tr><tr class="border-b border-border/50"><td class="py-2">Cumplimiento fiscal</td><td>Obligación legal</td><td>Datos de transacciones, país, registros de IVA</td></tr><tr class="border-b border-border/50"><td class="py-2">Seguridad y prevención del fraude</td><td>Interés legítimo</td><td>Dirección IP, información del dispositivo, patrones de uso</td></tr><tr class="border-b border-border/50"><td class="py-2">Verificación de edad</td><td>Obligación legal</td><td>Declaración de edad, documentos de identidad opcionales</td></tr><tr class="border-b border-border/50"><td class="py-2">Cumplimiento legal (controles de exportación, sanciones)</td><td>Obligación legal</td><td>País, detalles de transacciones</td></tr><tr class="border-b border-border/50"><td class="py-2">Mejora del servicio</td><td>Interés legítimo</td><td>Analítica de uso agregada</td></tr><tr class="border-b border-border/50"><td class="py-2">Atención al cliente</td><td>Ejecución del contrato</td><td>Datos de la cuenta, historial de comunicaciones</td></tr><tr><td class="py-2">Marketing (solo con consentimiento)</td><td>Consentimiento</td><td>Correo electrónico, preferencias</td></tr></tbody></table>',
      ],
    },
    {
      id: "privacy-4",
      title: "4. Cómo compartimos su información",
      paragraphs: [
        "No vendemos sus datos personales. Solo compartimos datos en las siguientes circunstancias:",
        '<ul class="list-disc pl-5 space-y-2"><li><strong>Proveedores de servicios:</strong> Procesadores de pago (Stripe, PayPal), proveedores de alojamiento (Render), servicios de correo electrónico, proveedores de analítica. Todos están sujetos a acuerdos de tratamiento de datos.</li><li><strong>Otros usuarios:</strong> Su información de perfil y publicaciones del foro son visibles para otros usuarios según el diseño del servicio.</li><li><strong>Requisitos legales:</strong> Cuando lo exija la ley, una orden judicial o una autoridad gubernamental. Le notificaremos salvo que esté prohibido.</li><li><strong>Transferencias empresariales:</strong> En relación con una fusión, adquisición o venta de activos, con aviso a los usuarios.</li><li><strong>Con su consentimiento:</strong> Para cualquier finalidad que usted autorice expresamente.</li></ul>',
      ],
    },
    {
      id: "privacy-5",
      title: "5. Conservación y eliminación de datos",
      paragraphs: [
        "Conservamos los datos personales el tiempo necesario para cumplir las finalidades descritas en esta Política:",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Datos de la cuenta:</strong> Hasta la eliminación de la cuenta o {{dataRetentionDays}} días de inactividad</li><li><strong>Registros de transacciones:</strong> {{transactionRetentionDays}} días (requisitos fiscales y legales)</li><li><strong>Publicaciones del foro:</strong> Hasta su eliminación por el usuario o el cierre de la cuenta</li><li><strong>Archivos de registro:</strong> 90 días</li><li><strong>Registros de consentimiento de cookies:</strong> 2 años</li></ul>',
        "Tras una solicitud de eliminación de la cuenta, eliminaremos o anonimizaremos sus datos personales en un plazo de 30 días, salvo cuando la ley exija su conservación (registros de transacciones con fines fiscales).",
      ],
    },
    {
      id: "privacy-6",
      title: "6. Seguridad de los datos",
      paragraphs: [
        "Implementamos medidas de seguridad conforme a los estándares del sector:",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Cifrado:</strong> TLS 1.3 para todos los datos en tránsito; AES-256 para datos en reposo</li><li><strong>Contraseñas:</strong> Hash bcrypt con factor de coste 12 (salida de 64 bytes/512 bits)</li><li><strong>Autenticación:</strong> Tokens JWT con cookies httpOnly; caducidad de la sesión tras 1 año</li><li><strong>Controles de acceso:</strong> Acceso basado en roles (usuario/administrador); principio de mínimo privilegio</li><li><strong>Supervisión:</strong> Registro automatizado de intentos de acceso; detección de anomalías</li><li><strong>Respuesta ante brechas:</strong> En caso de violación de datos, notificaremos a los usuarios afectados en un plazo de {{breachNotificationHours}} horas según lo exija {{privacyLaw}}.</li></ul>',
      ],
    },
    {
      id: "privacy-7",
      title: "7. Transferencias internacionales de datos",
      paragraphs: [
        "Sus datos se almacenan en servidores ubicados en los Estados Unidos. Para usuarios en la UE/EEE, el Reino Unido y otras jurisdicciones que exijan protecciones en las transferencias:",
        '<ul class="list-disc pl-5 space-y-1"><li>Utilizamos Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea</li><li>Para transferencias al Reino Unido, cumplimos el Anexo del Reino Unido a las CCT</li><li>Supervisamos las decisiones de adecuación y los desarrollos legales que afecten a las transferencias</li><li>Todas las transferencias están protegidas por cifrado en tránsito (TLS 1.3)</li></ul>',
      ],
    },
    {
      id: "privacy-8",
      title: "8. Política de cookies",
      paragraphs: [
        "Utilizamos cookies y tecnologías similares de la siguiente manera:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Categoría</th><th class="text-left py-2">Finalidad</th><th class="text-left py-2">Duración</th><th class="text-left py-2">¿Obligatoria?</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">Esenciales</td><td>Autenticación, seguridad, gestión de sesión</td><td>Sesión - 1 año</td><td>Sí (no se puede desactivar)</td></tr><tr class="border-b border-border/50"><td class="py-2">Preferencias</td><td>Selección de idioma, tema, ajustes de visualización</td><td>1 año</td><td>No</td></tr><tr class="border-b border-border/50"><td class="py-2">Analítica</td><td>Mejora del servicio, estadísticas de uso</td><td>1 año</td><td>No</td></tr><tr><td class="py-2">Marketing</td><td>Recomendaciones personalizadas (si hay consentimiento)</td><td>1 año</td><td>No</td></tr></tbody></table>',
        "{{cookieConsentNote}}",
      ],
    },
    {
      id: "privacy-9",
      title: "9. Privacidad de menores",
      paragraphs: [
        "Cumplimos con la COPPA (EE. UU.), los requisitos del RGPD relativos a menores (UE) y leyes equivalentes en todo el mundo. Nuestros Servicios no están dirigidos a menores de 13 años.",
        "No recopilamos a sabiendas información personal de menores de {{ageOfConsent}} años sin {{parentalConsentPhrase}}. Si usted es padre, madre o tutor y cree que su hijo ha proporcionado información personal sin consentimiento, contáctenos de inmediato y eliminaremos dicha información.",
        "Las secciones de nuestros Servicios con restricción de edad (foro social, mercado) exigen que los usuarios confirmen tener al menos 18 años.",
      ],
    },
    {
      id: "privacy-10",
      title: "10. Sus derechos de privacidad",
      paragraphs: [
        "Según su ubicación, puede tener los siguientes derechos:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Derecho</th><th class="text-left py-2">Descripción</th><th class="text-left py-2">Disponible en</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">Acceso</td><td>Solicitar una copia de sus datos personales</td><td>Todas las jurisdicciones</td></tr><tr class="border-b border-border/50"><td class="py-2">Rectificación</td><td>Solicitar la corrección de datos inexactos</td><td>Todas las jurisdicciones</td></tr><tr class="border-b border-border/50"><td class="py-2">Supresión (derecho al olvido)</td><td>Solicitar la eliminación de sus datos</td><td>{{rightToBeForgottenDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">Portabilidad</td><td>Recibir los datos en un formato estructurado y legible por máquina</td><td>{{dataPortabilityDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">Oposición</td><td>Oponerse al tratamiento basado en intereses legítimos</td><td>UE, Reino Unido, Brasil, Corea del Sur</td></tr><tr class="border-b border-border/50"><td class="py-2">Limitación</td><td>Solicitar la limitación del tratamiento</td><td>UE, Reino Unido, Brasil</td></tr><tr class="border-b border-border/50"><td class="py-2">Retirar el consentimiento</td><td>Retirar el consentimiento en cualquier momento</td><td>Todas las jurisdicciones (cuando el consentimiento sea la base)</td></tr><tr><td class="py-2">Presentar reclamación</td><td>Reclamar ante la autoridad de control</td><td>UE, Reino Unido, Brasil, Corea del Sur</td></tr></tbody></table>',
        "Para ejercer cualquier derecho, escríbanos a privacy@ramenanime.app. Respondemos en un plazo de 30 días.",
      ],
    },
    {
      id: "privacy-11",
      title: "11. Decisiones automatizadas y elaboración de perfiles",
      paragraphs: [
        "No realizamos elaboración de perfiles ni decisiones automatizadas que produzcan efectos jurídicos sobre usted, salvo en los siguientes casos:",
        '<ul class="list-disc pl-5 space-y-1"><li>Algoritmos de detección y prevención del fraude</li><li>Automatización de filtros de spam/contenido para publicaciones del foro</li><li>Control de acceso y cálculo fiscal basados en geolocalización</li></ul>',
        "Estos sistemas no dan lugar a decisiones automatizadas que afecten significativamente a sus derechos legales. Hay revisión humana disponible para decisiones impugnadas.",
      ],
    },
    {
      id: "privacy-12",
      title: "12. Cambios en esta Política",
      paragraphs: [
        'Podemos actualizar esta Política de Privacidad periódicamente. Los cambios sustanciales se notificarán por correo electrónico o aviso destacado al menos 30 días antes de su entrada en vigor. El uso continuado tras los cambios constituye aceptación. La fecha de "Última actualización" en la parte superior indica la revisión más reciente.',
      ],
    },
    {
      id: "privacy-13",
      title: "13. Contacto",
      paragraphs: [
        "<p><strong>Delegado de Protección de Datos:</strong> dpo@ramenanime.app</p>",
        "<p><strong>Consultas de privacidad:</strong> privacy@ramenanime.app</p>",
        "<p><strong>Dirección postal:</strong><br />Ramen Anime Privacy Office<br />123 Anime Street<br />Los Angeles, CA 90001<br />United States</p>",
        "<p><strong>Autoridades de control de la UE:</strong> Tiene derecho a presentar una reclamación ante su autoridad local de protección de datos. Puede consultar la lista en: https://edpb.europa.eu/about-edpb/board/members</p>",
      ],
    },
  ],
};

export const terms: LegalDocumentContent = {
  quickSummaryTitle: "",
  quickSummaryBody: "",
  lastUpdated: "2 de mayo de 2025",
  sections: [
    {
      id: "terms-1",
      title: "1. Aceptación de los Términos",
      paragraphs: [
        'Al acceder o utilizar Ramen Anime ("Ramen Anime", "nosotros", "nos" o "nuestro"), incluido nuestro sitio web, aplicaciones móviles, mercado, foro social y cualquier servicio relacionado (en conjunto, los "Servicios"), usted acepta quedar vinculado por estos Términos de Servicio ("Términos"). Si no está de acuerdo con estos Términos, no debe acceder ni utilizar los Servicios.',
        "Estos Términos constituyen un acuerdo legalmente vinculante entre usted y Ramen Anime. Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios serán efectivos inmediatamente tras su publicación. El uso continuado de los Servicios tras los cambios constituye la aceptación de los Términos revisados. Le notificaremos los cambios sustanciales por correo electrónico o aviso destacado en los Servicios al menos 30 días antes de su entrada en vigor, según lo exijan las leyes de protección al consumidor aplicables.",
        "Si accede a los Servicios desde la Unión Europea, estos Términos se complementan con nuestras disposiciones específicas para la UE. Si reside en California, sus derechos bajo la Ley de Privacidad del Consumidor de California (CCPA) y la Ley de Derechos de Privacidad de California (CPRA) se mantienen y no quedan limitados por estos Términos.",
      ],
    },
    {
      id: "terms-2",
      title: "2. Elegibilidad y registro de cuenta",
      paragraphs: [
        "<p><strong>2.1 Requisitos de edad.</strong> Debe tener al menos 18 años para crear una cuenta y utilizar la totalidad de los Servicios, incluidos el mercado y el foro social de Ramen Anime. Si es menor de 18 años, solo puede utilizar los Servicios con la participación y el consentimiento de un padre, madre o tutor legal, y únicamente las funciones generales de la tienda que no impliquen interacción entre usuarios. Al crear una cuenta, usted declara y garantiza que cumple estos requisitos de edad.</p>",
        "<p><strong>2.2 Consentimiento parental.</strong> En virtud de {{privacyLaw}}, si es menor de {{ageOfConsent}} años, se requiere consentimiento parental verificable antes de que recopilemos, utilicemos o divulguemos su información personal. Utilizamos la verificación por correo electrónico con confirmación de seguimiento como mecanismo de consentimiento parental, de conformidad con la COPPA (si se encuentra en EE. UU.) y marcos equivalentes.</p>",
        "<p><strong>2.3 Seguridad de la cuenta.</strong> Usted es responsable de mantener la confidencialidad de las credenciales de su cuenta y de todas las actividades que se realicen bajo la misma. Debe notificarnos de inmediato cualquier uso no autorizado. Implementamos medidas de seguridad conforme a los estándares del sector, incluido el hash de contraseñas bcrypt con factor de coste 12, cifrado HTTPS/TLS 1.3 para todos los datos en tránsito y gestión de sesiones basada en JWT con cookies httpOnly.</p>",
        "<p><strong>2.4 Terminación de la cuenta.</strong> Nos reservamos el derecho de suspender o terminar su cuenta a nuestra entera discreción por incumplimientos de estos Términos, actividad ilegal o para la protección de nuestra comunidad. En la UE, tiene derecho a terminar su cuenta en cualquier momento y solicitar la eliminación de datos en virtud del artículo 17 del RGPD.</p>",
      ],
    },
    {
      id: "terms-3",
      title: "3. Privacidad y protección de datos",
      paragraphs: [
        "Su privacidad se rige por nuestra Política de Privacidad, incorporada a estos Términos por referencia. Nuestras prácticas de datos cumplen con {{privacyLaw}}.",
        "<p><strong>3.1 Recopilación de datos.</strong> Recopilamos: (a) información de la cuenta (nombre de usuario, correo electrónico, hash de contraseña); (b) información de perfil que usted proporcione voluntariamente; (c) datos de transacciones de compras en el mercado; (d) publicaciones y comentarios del foro; (e) dirección IP e información del dispositivo para seguridad y cumplimiento de geolocalización; (f) cookies y tecnologías similares según se detalla en nuestra Política de cookies.</p>",
        "<p><strong>3.2 Base jurídica del tratamiento (RGPD/LGPD).</strong> Para usuarios en jurisdicciones que exijan una base jurídica, tratamos datos personales sobre las siguientes bases: (a) ejecución del contrato (prestación de los Servicios); (b) intereses legítimos (seguridad, prevención del fraude); (c) obligación legal (declaraciones fiscales, solicitudes de las autoridades); (d) consentimiento (comunicaciones de marketing, funciones opcionales).</p>",
        "<p><strong>3.3 Sus derechos.</strong> Según su jurisdicción, puede tener derecho a: acceder a sus datos, rectificar inexactitudes, eliminar su cuenta y datos (derecho al olvido), oponerse al tratamiento, portabilidad de datos, retirar el consentimiento y presentar reclamaciones ante las autoridades de control. Para ejercer estos derechos, contáctenos en la dirección indicada en la Sección 16.</p>",
        "<p><strong>3.4 Conservación de datos.</strong> Conservamos sus datos personales durante {{dataRetentionDays}} días, o el tiempo necesario para cumplir las finalidades para las que se recopilaron, cumplir obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos. Tras este período, los datos se eliminan o anonimizan de forma segura.</p>",
        "<p><strong>3.5 Transferencias internacionales.</strong> Sus datos pueden transferirse y tratarse en países distintos al de su residencia, incluidos los Estados Unidos, donde se encuentran nuestros servidores. Para transferencias desde la UE/EEE, el Reino Unido u otras jurisdicciones que exijan protecciones de adecuación, implementamos Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea.</p>",
      ],
    },
    {
      id: "terms-4",
      title: "4. Términos del mercado",
      paragraphs: [
        "<p><strong>4.1 Naturaleza del mercado.</strong> El mercado de Ramen Anime es una plataforma que conecta a compradores y vendedores de mercancía de anime. No somos parte en las transacciones entre usuarios. No adquirimos la titularidad de los artículos vendidos ni garantizamos la calidad, seguridad o legalidad de los artículos publicados.</p>",
        "<p><strong>4.2 Obligaciones del vendedor.</strong> Los vendedores deben: (a) describir los artículos con exactitud; (b) cumplir todas las leyes aplicables relativas a la venta de bienes; (c) no vender artículos prohibidos, incluidos productos falsificados, armas, sustancias reguladas o artículos que infrinjan derechos de propiedad intelectual; (d) enviar los artículos en el plazo especificado; (e) recaudar y ingresar todos los impuestos aplicables según exija su jurisdicción.</p>",
        "<p><strong>4.3 Obligaciones del comprador.</strong> Los compradores deben: (a) pagar los artículos con prontitud; (b) no realizar contracargos fraudulentos; (c) informar de problemas en un plazo de 30 días desde la entrega. Los compradores son responsables de comprender las restricciones de importación y los aranceles aduaneros en su país.</p>",
        "<p><strong>4.4 Artículos prohibidos.</strong> No pueden venderse: mercancía falsificada, armas o réplicas de armas, material para adultos, artículos que promuevan el discurso de odio o la violencia, bienes robados, artículos sujetos a controles de exportación (militares/de doble uso) y cualquier artículo prohibido por las leyes locales del comprador o del vendedor.</p>",
        "<p><strong>4.5 Resolución de disputas.</strong> En disputas entre compradores y vendedores, ambas partes deben intentar primero la resolución mediante nuestro proceso interno de disputas. Si no se resuelve en 14 días, las disputas pueden elevarse a mediación. Los usuarios en la UE también pueden utilizar la plataforma europea de resolución de litigios en línea (RLL).</p>",
        "<p><strong>4.6 Cumplimiento fiscal.</strong> Los precios mostrados en Ramen Anime pueden incluir o no el IVA/impuestos según su ubicación. Calculamos y mostramos automáticamente los impuestos aplicables según el país del comprador mediante nuestro motor fiscal. Los vendedores son responsables de ingresar los impuestos recaudados ante las autoridades fiscales locales. Proporcionamos registros de transacciones para facilitar la declaración fiscal.</p>",
        "<p><strong>4.7 Comisiones de la plataforma.</strong> Cobramos una comisión de plataforma sobre las transacciones completadas. Comisiones actuales: 8% del precio del artículo para vendedores estándar, 5% para vendedores verificados. Las comisiones pueden modificarse con un aviso de 30 días.</p>",
      ],
    },
    {
      id: "terms-5",
      title: "5. IVA, GST y cumplimiento fiscal",
      paragraphs: [
        "<p><strong>5.1 Recaudación de impuestos.</strong> Ramen Anime opera como facilitador del mercado en jurisdicciones que exigen la recaudación fiscal en plataformas de mercado. Calculamos, recaudamos e ingresamos automáticamente los impuestos aplicables, incluido el IVA (UE/Reino Unido), el GST (Australia, Canadá, Singapur), el impuesto al consumo (Japón) y el impuesto sobre las ventas estatal (EE. UU.) cuando la ley lo exija.</p>",
        "<p><strong>5.2 IVA de la UE.</strong> Para compradores en Estados miembros de la UE, el IVA se aplica al tipo vigente en el país de residencia del comprador. Esto sigue las normas de comercio electrónico del IVA de la UE (Directiva del Consejo 2017/2455 y 2019/1995). Los vendedores no necesitan registrarse por separado a efectos del IVA para ventas en el mercado en la UE.</p>",
        "<p><strong>5.3 IVA del Reino Unido.</strong> Para compradores en el Reino Unido, se aplica el IVA del Reino Unido al 20% a servicios digitales y bienes aplicables. Esto sigue la normativa de comercio electrónico del IVA del Reino Unido tras el Brexit.</p>",
        "<p><strong>5.4 Impuesto sobre las ventas en EE. UU.</strong> Recaudamos el impuesto sobre las ventas en los estados de EE. UU. donde tenemos nexo económico o donde se aplican las leyes de facilitador del mercado. Los compradores en estados sin impuesto sobre las ventas no serán gravados.</p>",
        "<p><strong>5.5 Impuesto sobre servicios digitales.</strong> En jurisdicciones con impuesto sobre servicios digitales (ISD), los impuestos aplicables se incluyen en el cálculo de la comisión de la plataforma y se ingresan según corresponda.</p>",
        "<p><strong>5.6 Registros fiscales.</strong> Proporcionamos informes fiscales a nivel de transacción a los vendedores. Los compradores reciben facturas fiscales cuando sea necesario. Conservamos registros fiscales durante {{taxRecordRetentionYears}} años según exijan las leyes fiscales aplicables.</p>",
        "<p><strong>5.7 Aranceles de exportación.</strong> En envíos internacionales, los compradores son responsables de los derechos de importación, tasas aduaneras o aranceles impuestos en su país. No están incluidos en el precio de compra salvo que se indique expresamente.</p>",
      ],
    },
    {
      id: "terms-6",
      title: "6. Foro social y contenido de usuario",
      paragraphs: [
        "<p><strong>6.1 Titularidad del contenido.</strong> Usted conserva la titularidad del contenido que publique en el foro, su perfil y comentarios. Al publicar, nos otorga una licencia mundial, no exclusiva y libre de regalías para usar, reproducir, modificar, adaptar, publicar y mostrar dicho contenido con el fin de operar y promocionar los Servicios.</p>",
        "<p><strong>6.2 Estándares de contenido.</strong> No puede publicar contenido que: (a) sea ilegal, dañino, amenazante, abusivo, acosador, difamatorio o invasivo de la privacidad; (b) infrinja derechos de propiedad intelectual; (c) contenga malware o código dañino; (d) promueva actividades ilegales; (e) contenga contenido sexual explícito (nuestra plataforma está dirigida al público general con contenido relacionado con el anime); (f) constituya spam o publicidad no autorizada.</p>",
        "<p><strong>6.3 Moderación de contenido.</strong> Nos reservamos el derecho de eliminar contenido que infrinja estos Términos. Empleamos sistemas automatizados y moderadores humanos. Nuestras decisiones de moderación son definitivas. En virtud de la Ley de Servicios Digitales (DSA) de la UE, tiene derecho a recurrir las decisiones de moderación.</p>",
        "<p><strong>6.4 Contenido con restricción de edad.</strong> Determinadas secciones del foro requieren verificación de edad. No debe intentar eludir los sistemas de verificación de edad. Proporcionar información falsa sobre la edad es motivo de terminación inmediata de la cuenta.</p>",
      ],
    },
    {
      id: "terms-7",
      title: "7. Propiedad intelectual",
      paragraphs: [
        "<p><strong>7.1 Nuestra PI.</strong> Los Servicios, incluido todo el software, diseños, logotipos, marcas y contenido que proporcionamos, son propiedad de Ramen Anime o de nuestros licenciantes y están protegidos por las leyes de derechos de autor, marcas y otras leyes de propiedad intelectual. No puede utilizar nuestras marcas sin consentimiento previo por escrito.</p>",
        "<p><strong>7.2 DMCA / aviso y retirada.</strong> Cumplimos con la Ley de Derechos de Autor del Milenio Digital (DMCA) y procedimientos equivalentes de aviso y retirada en otras jurisdicciones. Si cree que algún contenido infringe sus derechos de autor, envíe un aviso de retirada al contacto de la Sección 16 con: (a) su información de contacto; (b) identificación de la obra protegida; (c) identificación del material infractor; (d) una declaración de creencia de buena fe; (e) una declaración bajo pena de perjurio; (f) su firma electrónica.</p>",
        "<p><strong>7.3 Contraaviso.</strong> Si su contenido fue eliminado por un aviso DMCA, puede presentar un contraaviso. Lo remitiremos al reclamante original y restableceremos el contenido tras 10 días hábiles salvo que se interponga acción legal.</p>",
      ],
    },
    {
      id: "terms-8",
      title: "8. Procesamiento de pagos",
      paragraphs: [
        "Los pagos se procesan a través de procesadores de pago de terceros (Stripe, PayPal). Al realizar una compra, usted acepta sus términos. No almacenamos números completos de tarjetas de pago. El cumplimiento de PCI DSS lo mantienen nuestros procesadores de pago.",
        "Los reembolsos se procesan según nuestra Política de reembolsos: (a) bienes digitales: sin reembolso tras la descarga; (b) bienes físicos: período de devolución de 14 días en virtud de la Directiva de derechos de los consumidores de la UE; (c) artículos del mercado: sujetos a la política de devolución del vendedor con mediación de la plataforma disponible.",
      ],
    },
    {
      id: "terms-9",
      title: "9. Conducta prohibida",
      paragraphs: [
        "Usted no puede: (a) utilizar los Servicios con cualquier fin ilegal; (b) intentar obtener acceso no autorizado a cualquier parte de los Servicios; (c) interferir o interrumpir los Servicios; (d) utilizar sistemas automatizados (bots, rastreadores) sin autorización; (e) recopilar datos de usuarios; (f) suplantar a cualquier persona o entidad; (g) eludir la geolocalización o la verificación de edad; (h) participar en blanqueo de capitales o financiación del terrorismo; (i) infringir las leyes de control de exportaciones; (j) revender o explotar comercialmente los Servicios sin autorización.",
      ],
    },
    {
      id: "terms-10",
      title: "10. Limitación de responsabilidad",
      paragraphs: [
        '<p><strong>10.1 Exención de responsabilidad.</strong> LOS SERVICIOS SE PROPORCIONAN "TAL CUAL" Y "SEGÚN DISPONIBILIDAD" SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS, INCLUIDAS, ENTRE OTRAS, LAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN DETERMINADO Y NO INFRACCIÓN.</p>',
        "<p><strong>10.2 Límite de responsabilidad.</strong> En la máxima medida permitida por la ley, nuestra responsabilidad total no excederá el importe que usted nos haya pagado en los 12 meses anteriores a la reclamación, o 100 USD, lo que sea mayor. Esta limitación no se aplica a: (a) negligencia grave o conducta dolosa; (b) muerte o lesiones personales; (c) fraude; (d) cuando lo prohíban las leyes de protección al consumidor.</p>",
        "<p><strong>10.3 Excepción para consumidores de la UE.</strong> Si es consumidor en la UE, los derechos legales de consumo en virtud del derecho de la UE no se ven afectados por estas limitaciones, incluidos los derechos en virtud de la Directiva de ventas y garantías al consumidor.</p>",
        "<p><strong>10.4 Fuerza mayor.</strong> No somos responsables de fallos causados por circunstancias fuera de nuestro control razonable, incluidos desastres naturales, guerras, terrorismo, disturbios, embargos, actos de autoridades civiles o militares, incendios, inundaciones, accidentes, huelgas o escasez de transporte, instalaciones, combustible, energía, mano de obra o materiales.</p>",
      ],
    },
    {
      id: "terms-11",
      title: "11. Resolución de disputas y ley aplicable",
      paragraphs: [
        "<p><strong>11.1 Ley aplicable.</strong> Estos Términos se rigen por las leyes del Estado de California, EE. UU., sin tener en cuenta los principios de conflicto de leyes, salvo cuando las leyes imperativas de protección al consumidor de su país de residencia prevalezcan.</p>",
        "<p><strong>11.2 Usuarios de la UE.</strong> Si es consumidor en la UE, se beneficia adicionalmente de las leyes imperativas de protección al consumidor de su Estado miembro de la UE. Cualquier disputa puede plantearse ante los tribunales de su lugar de residencia.</p>",
        "<p><strong>11.3 Arbitraje (usuarios de EE. UU.).</strong> Para usuarios en los Estados Unidos, cualquier disputa se intentará resolver primero mediante negociación de buena fe. Si no se resuelve en 30 días, cualquiera de las partes puede iniciar arbitraje vinculante bajo las Reglas de Arbitraje Comercial de la Asociación Americana de Arbitraje (AAA). El arbitraje se celebrará en Los Ángeles, California.</p>",
        "<p><strong>11.4 Renuncia a acciones colectivas.</strong> EN LA MEDIDA PERMITIDA POR LA LEY, USTED ACEPTA QUE CUALQUIER PROCEDIMIENTO SE LLEVARÁ A CABO ÚNICAMENTE DE FORMA INDIVIDUAL Y NO EN UNA ACCIÓN COLECTIVA, CONSOLIDADA O REPRESENTATIVA. Esta renuncia no se aplica a reclamaciones bajo leyes de protección al consumidor que prohíban las renuncias a acciones colectivas.</p>",
        "<p><strong>11.5 Plataforma RLL.</strong> Los consumidores de la UE pueden utilizar la plataforma de resolución de litigios en línea de la Comisión Europea: https://ec.europa.eu/odr</p>",
      ],
    },
    {
      id: "terms-12",
      title: "12. Controles de exportación y sanciones",
      paragraphs: [
        "No puede utilizar los Servicios para exportar, reexportar o transferir artículos en violación de las leyes de control de exportaciones aplicables, incluidos los Reglamentos de Administración de Exportaciones de EE. UU. (EAR), el Reglamento de doble uso de la UE 2021/821 o las sanciones del Consejo de Seguridad de la ONU. Los artículos prohibidos incluyen bienes militares, artículos de doble uso y artículos destinados a países o entidades sancionados.",
      ],
    },
    {
      id: "terms-13",
      title: "13. Privacidad de menores (cumplimiento COPPA)",
      paragraphs: [
        "Cumplimos con la Ley de Protección de la Privacidad en Línea de los Niños (COPPA) y leyes equivalentes en todo el mundo. No recopilamos a sabiendas información personal de menores de 13 años sin consentimiento parental verificable. Si tenemos conocimiento de que hemos recopilado información personal de un menor de 13 años sin consentimiento parental, eliminaremos dicha información de inmediato.",
        "Los padres, madres o tutores que crean que su hijo nos ha proporcionado información personal pueden contactarnos para solicitar su eliminación.",
      ],
    },
    {
      id: "terms-14",
      title: "14. Terminación",
      paragraphs: [
        "Puede terminar su cuenta en cualquier momento a través de la configuración de la cuenta o contactándonos. Podemos terminar o suspender su cuenta de inmediato por incumplimientos de estos Términos. Tras la terminación, su derecho a utilizar los Servicios cesa de inmediato. Las disposiciones que por su naturaleza deban subsistir tras la terminación subsistirán.",
        "En virtud del artículo 17 del RGPD, tiene derecho a solicitar la supresión de sus datos personales. Cumpliremos en un plazo de 30 días salvo que obligaciones legales exijan su conservación.",
      ],
    },
    {
      id: "terms-15",
      title: "15. Geolocalización y disponibilidad del servicio",
      paragraphs: [
        "Utilizamos tecnología de geolocalización para determinar su país de acceso. Los Servicios solo están disponibles en los países que hemos configurado para el acceso. Esto es necesario para el cumplimiento legal, incluidos los controles de exportación, los requisitos de verificación de edad y las obligaciones fiscales.",
        "Podemos restringir el acceso desde determinados países o regiones por requisitos legales, sanciones u otras consideraciones de cumplimiento. Intentar eludir las restricciones de geolocalización constituye una infracción de estos Términos.",
      ],
    },
    {
      id: "terms-16",
      title: "16. Información de contacto",
      paragraphs: [
        "Para avisos legales, solicitudes de privacidad, retiradas DMCA o consultas generales:",
        "<p><strong>Departamento Legal de Ramen Anime</strong><br />Correo electrónico: legal@ramenanime.app<br />Dirección: Ramen Anime, 123 Anime Street, Los Angeles, CA 90001, USA</p>",
        "<p><strong>Delegado de Protección de Datos (UE/Reino Unido):</strong><br />Correo electrónico: dpo@ramenanime.app</p>",
        "<p><strong>Autoridad de control (UE):</strong><br />Tiene derecho a presentar una reclamación ante su autoridad local de protección de datos.</p>",
      ],
    },
  ],
};

export const legalEs = {
  legalPrivacy: privacy,
  legalTerms: terms,
};
