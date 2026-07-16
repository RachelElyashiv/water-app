// ---------- languages ----------
const LANGS = [
  { code: "he", name: "עברית",    dir: "rtl", locale: "he-IL" },
  { code: "en", name: "English",  dir: "ltr", locale: "en-US" },
  { code: "ar", name: "العربية",  dir: "rtl", locale: "ar" },
  { code: "de", name: "Deutsch",  dir: "ltr", locale: "de-DE" },
  { code: "fr", name: "Français", dir: "ltr", locale: "fr-FR" },
  { code: "es", name: "Español",  dir: "ltr", locale: "es-ES" },
  { code: "hi", name: "हिन्दी",     dir: "ltr", locale: "hi-IN" },
];

// key -> { he, en, ar, de, fr, es, hi }
const TR = {
  brand_unit:      { he:"ל׳", en:"L", ar:"ل", de:"L", fr:"L", es:"L", hi:"ली" },
  app_subtitle:    { he:"יומן הידרציה למניעת הישנות אבני כליות", en:"Hydration journal to prevent kidney-stone recurrence", ar:"مذكرة الترطيب للوقاية من عودة حصى الكلى", de:"Hydrations-Tagebuch zur Vorbeugung von Nierensteinen", fr:"Journal d’hydratation pour prévenir la récidive des calculs rénaux", es:"Diario de hidratación para prevenir la recurrencia de cálculos renales", hi:"गुर्दे की पथरी की पुनरावृत्ति रोकने के लिए हाइड्रेशन डायरी" },
  login:           { he:"התחברות", en:"Log in", ar:"تسجيل الدخول", de:"Anmelden", fr:"Connexion", es:"Iniciar sesión", hi:"लॉग इन" },
  register:        { he:"הרשמה", en:"Sign up", ar:"إنشاء حساب", de:"Registrieren", fr:"S’inscrire", es:"Registrarse", hi:"साइन अप" },
  name:            { he:"שם", en:"Name", ar:"الاسم", de:"Name", fr:"Nom", es:"Nombre", hi:"नाम" },
  email:           { he:"אימייל", en:"Email", ar:"البريد الإلكتروني", de:"E-Mail", fr:"E-mail", es:"Correo electrónico", hi:"ईमेल" },
  password:        { he:"סיסמה", en:"Password", ar:"كلمة المرور", de:"Passwort", fr:"Mot de passe", es:"Contraseña", hi:"पासवर्ड" },
  install_app:     { he:"📲 התקן כאפליקציה", en:"📲 Install as app", ar:"📲 تثبيت كتطبيق", de:"📲 Als App installieren", fr:"📲 Installer comme app", es:"📲 Instalar como app", hi:"📲 ऐप के रूप में इंस्टॉल करें" },
  ios_hint:        { he:"להתקנה ב־iPhone: לחצו על כפתור השיתוף בתחתית הדפדפן, ואז «הוסף למסך הבית».", en:"To install on iPhone: tap the Share button at the bottom of the browser, then “Add to Home Screen”.", ar:"للتثبيت على iPhone: اضغط زر المشاركة أسفل المتصفح ثم «أضف إلى الشاشة الرئيسية».", de:"Auf dem iPhone installieren: Teilen-Symbol unten im Browser tippen, dann „Zum Home-Bildschirm“.", fr:"Pour installer sur iPhone : appuyez sur le bouton Partager en bas du navigateur, puis « Sur l’écran d’accueil ».", es:"Para instalar en iPhone: toca el botón Compartir en la parte inferior del navegador y luego «Añadir a la pantalla de inicio».", hi:"iPhone पर इंस्टॉल करने के लिए: ब्राउज़र के नीचे शेयर बटन दबाएँ, फिर «होम स्क्रीन में जोड़ें»।" },
  hello:           { he:"שלום,", en:"Hello,", ar:"مرحبًا،", de:"Hallo,", fr:"Bonjour,", es:"Hola,", hi:"नमस्ते," },
  logout:          { he:"התנתקות", en:"Log out", ar:"تسجيل الخروج", de:"Abmelden", fr:"Déconnexion", es:"Cerrar sesión", hi:"लॉग आउट" },
  tab_today:       { he:"היום", en:"Today", ar:"اليوم", de:"Heute", fr:"Aujourd’hui", es:"Hoy", hi:"आज" },
  tab_trends:      { he:"מגמות", en:"Trends", ar:"الاتجاهات", de:"Trends", fr:"Tendances", es:"Tendencias", hi:"रुझान" },
  tab_report:      { he:"דוח", en:"Report", ar:"تقرير", de:"Bericht", fr:"Rapport", es:"Informe", hi:"रिपोर्ट" },
  tab_settings:    { he:"הגדרות", en:"Settings", ar:"الإعدادات", de:"Einstellungen", fr:"Réglages", es:"Ajustes", hi:"सेटिंग्स" },
  drink_title:     { he:"שתייה", en:"Drinking", ar:"الشرب", de:"Trinken", fr:"Boisson", es:"Bebida", hi:"पेय" },
  goal_sub:        { he:"היעד היומי: {goal} ליטר צריכה — בהתאם להנחיה הרפואית שקיבלת", en:"Daily goal: {goal} liters intake — per the medical guidance you received", ar:"الهدف اليومي: {goal} لتر — وفق التوجيه الطبي الذي تلقيته", de:"Tagesziel: {goal} Liter — gemäß deiner ärztlichen Vorgabe", fr:"Objectif quotidien : {goal} litres — selon l’avis médical reçu", es:"Meta diaria: {goal} litros — según la indicación médica recibida", hi:"दैनिक लक्ष्य: {goal} लीटर — आपको मिली चिकित्सकीय सलाह के अनुसार" },
  ring_of:         { he:"מתוך {goal} ליטר", en:"of {goal} liters", ar:"من {goal} لتر", de:"von {goal} Litern", fr:"sur {goal} litres", es:"de {goal} litros", hi:"{goal} लीटर में से" },
  goal_reached:    { he:"היעד הושג ✓", en:"Goal reached ✓", ar:"تم تحقيق الهدف ✓", de:"Ziel erreicht ✓", fr:"Objectif atteint ✓", es:"Meta alcanzada ✓", hi:"लक्ष्य पूरा ✓" },
  cup_glass:       { he:"כוס", en:"Glass", ar:"كوب", de:"Glas", fr:"Verre", es:"Vaso", hi:"गिलास" },
  cup_can:         { he:"פחית", en:"Can", ar:"علبة", de:"Dose", fr:"Canette", es:"Lata", hi:"कैन" },
  cup_bottle:      { he:"בקבוק", en:"Bottle", ar:"زجاجة", de:"Flasche", fr:"Bouteille", es:"Botella", hi:"बोतल" },
  cup_bottle_lg:   { he:"בקבוק גדול", en:"Large bottle", ar:"زجاجة كبيرة", de:"Große Flasche", fr:"Grande bouteille", es:"Botella grande", hi:"बड़ी बोतल" },
  ml:              { he:"מ״ל", en:"ml", ar:"مل", de:"ml", fr:"ml", es:"ml", hi:"मि.ली." },
  undo_last:       { he:"ביטול הרישום האחרון", en:"Undo last entry", ar:"تراجع عن آخر إدخال", de:"Letzten Eintrag rückgängig", fr:"Annuler la dernière saisie", es:"Deshacer último registro", hi:"अंतिम प्रविष्टि पूर्ववत करें" },
  today_log_title: { he:"יומן היום", en:"Today's log", ar:"سجل اليوم", de:"Heutiges Protokoll", fr:"Journal du jour", es:"Registro de hoy", hi:"आज का लॉग" },
  today_log_sub:   { he:"כל הרישומים של היום — אפשר למחוק כל אחד", en:"All of today's entries — each can be deleted", ar:"جميع إدخالات اليوم — يمكن حذف أي منها", de:"Alle heutigen Einträge — jeder löschbar", fr:"Toutes les saisies du jour — chacune supprimable", es:"Todos los registros de hoy — cada uno se puede borrar", hi:"आज की सभी प्रविष्टियाँ — प्रत्येक हटाई जा सकती है" },
  no_entries_today:{ he:"עדיין אין רישומים היום", en:"No entries yet today", ar:"لا توجد إدخالات اليوم بعد", de:"Heute noch keine Einträge", fr:"Aucune saisie aujourd’hui", es:"Aún no hay registros hoy", hi:"आज अभी कोई प्रविष्टि नहीं" },
  delete:          { he:"מחק", en:"Delete", ar:"حذف", de:"Löschen", fr:"Supprimer", es:"Borrar", hi:"हटाएँ" },
  urine_title:     { he:"צבע השתן", en:"Urine color", ar:"لون البول", de:"Urinfarbe", fr:"Couleur de l’urine", es:"Color de la orina", hi:"मूत्र का रंग" },
  urine_sub:       { he:"סמן את הצבע הקרוב ביותר בביקור האחרון בשירותים — זה המדד האמין ביותר להידרציה שלך", en:"Mark the closest color from your last bathroom visit — the most reliable hydration indicator", ar:"حدد أقرب لون من آخر زيارة للحمام — أدق مؤشر على الترطيب", de:"Markiere die Farbe deines letzten Toilettengangs — der zuverlässigste Hydrations-Indikator", fr:"Indiquez la couleur la plus proche de votre dernier passage aux toilettes — l’indicateur d’hydratation le plus fiable", es:"Marca el color más cercano de tu última visita al baño — el indicador de hidratación más fiable", hi:"अपनी पिछली बार के सबसे नज़दीकी रंग को चिह्नित करें — हाइड्रेशन का सबसे विश्वसनीय संकेतक" },
  urine_ok:        { he:"תקין (1–3)", en:"Normal (1–3)", ar:"طبيعي (1–3)", de:"Normal (1–3)", fr:"Normal (1–3)", es:"Normal (1–3)", hi:"सामान्य (1–3)" },
  urine_drink:     { he:"שתה עכשיו (6–8)", en:"Drink now (6–8)", ar:"اشرب الآن (6–8)", de:"Jetzt trinken (6–8)", fr:"Buvez maintenant (6–8)", es:"Bebe ahora (6–8)", hi:"अभी पिएँ (6–8)" },
  urine_good:      { he:"מצוין — רמת ההידרציה טובה", en:"Excellent — hydration is good", ar:"ممتاز — الترطيب جيد", de:"Ausgezeichnet — gute Hydration", fr:"Excellent — bonne hydratation", es:"Excelente — buena hidratación", hi:"उत्कृष्ट — हाइड्रेशन अच्छा है" },
  urine_mid:       { he:"בינוני — הוסף כוס מים בשעה הקרובה", en:"Moderate — add a glass of water within the hour", ar:"متوسط — أضف كوب ماء خلال ساعة", de:"Mäßig — trinke innerhalb einer Stunde ein Glas Wasser", fr:"Modéré — buvez un verre d’eau dans l’heure", es:"Moderado — bebe un vaso de agua en una hora", hi:"मध्यम — एक घंटे में एक गिलास पानी लें" },
  urine_dark:      { he:"כהה — שתה 500 מ״ל בהקדם", en:"Dark — drink 500 ml soon", ar:"داكن — اشرب 500 مل قريبًا", de:"Dunkel — bald 500 ml trinken", fr:"Foncé — buvez 500 ml bientôt", es:"Oscuro — bebe 500 ml pronto", hi:"गहरा — जल्द ही 500 मि.ली. पिएँ" },
  pain_title:      { he:"אירוע כאב", en:"Pain event", ar:"نوبة ألم", de:"Schmerzereignis", fr:"Épisode de douleur", es:"Episodio de dolor", hi:"दर्द की घटना" },
  pain_sub:        { he:"תיעוד התקפים עוזר לרופא לזהות דפוסים מול נתוני השתייה", en:"Logging attacks helps your doctor spot patterns against your drinking data", ar:"تسجيل النوبات يساعد طبيبك على اكتشاف الأنماط مقابل بيانات الشرب", de:"Das Erfassen von Anfällen hilft dem Arzt, Muster zu erkennen", fr:"Enregistrer les crises aide votre médecin à repérer des tendances", es:"Registrar los episodios ayuda a tu médico a detectar patrones", hi:"हमलों को दर्ज करने से डॉक्टर को पैटर्न पहचानने में मदद मिलती है" },
  pain_add:        { he:"+ תיעוד כאב", en:"+ Log pain", ar:"+ تسجيل ألم", de:"+ Schmerz erfassen", fr:"+ Enregistrer douleur", es:"+ Registrar dolor", hi:"+ दर्द दर्ज करें" },
  pain_intensity:  { he:"עוצמה:", en:"Intensity:", ar:"الشدة:", de:"Intensität:", fr:"Intensité :", es:"Intensidad:", hi:"तीव्रता:" },
  pain_note_ph:    { he:"הערה (מיקום, נסיבות…) — לא חובה", en:"Note (location, circumstances…) — optional", ar:"ملاحظة (المكان، الظروف…) — اختياري", de:"Notiz (Ort, Umstände…) — optional", fr:"Note (lieu, circonstances…) — facultatif", es:"Nota (ubicación, circunstancias…) — opcional", hi:"नोट (स्थान, परिस्थिति…) — वैकल्पिक" },
  pain_save:       { he:"שמירת האירוע", en:"Save event", ar:"حفظ الحدث", de:"Ereignis speichern", fr:"Enregistrer l’épisode", es:"Guardar episodio", hi:"घटना सहेजें" },
  cancel:          { he:"ביטול", en:"Cancel", ar:"إلغاء", de:"Abbrechen", fr:"Annuler", es:"Cancelar", hi:"रद्द करें" },
  pain_summary:    { he:"תועדו היום {count} אירועים (עוצמה אחרונה: {level})", en:"{count} events logged today (last intensity: {level})", ar:"تم تسجيل {count} نوبات اليوم (آخر شدة: {level})", de:"Heute {count} Ereignisse erfasst (letzte Intensität: {level})", fr:"{count} épisodes enregistrés aujourd’hui (dernière intensité : {level})", es:"{count} episodios registrados hoy (última intensidad: {level})", hi:"आज {count} घटनाएँ दर्ज (अंतिम तीव्रता: {level})" },
  week_title:      { he:"7 הימים האחרונים", en:"Last 7 days", ar:"آخر 7 أيام", de:"Letzte 7 Tage", fr:"7 derniers jours", es:"Últimos 7 días", hi:"पिछले 7 दिन" },
  week_sub:        { he:"הקו המקווקו מסמן את היעד", en:"The dashed line marks the goal", ar:"الخط المتقطع يمثل الهدف", de:"Die gestrichelte Linie markiert das Ziel", fr:"La ligne pointillée indique l’objectif", es:"La línea discontinua marca la meta", hi:"धारीदार रेखा लक्ष्य दर्शाती है" },
  month_title:     { he:"סיכום 30 יום", en:"30-day summary", ar:"ملخص 30 يومًا", de:"30-Tage-Zusammenfassung", fr:"Résumé sur 30 jours", es:"Resumen de 30 días", hi:"30-दिन का सारांश" },
  stat_avg:        { he:"צריכה יומית ממוצעת", en:"Average daily intake", ar:"متوسط الاستهلاك اليومي", de:"Durchschn. Tagesmenge", fr:"Apport quotidien moyen", es:"Ingesta diaria media", hi:"औसत दैनिक सेवन" },
  stat_goal_days:  { he:"ימים בהם הושג היעד", en:"Days goal met", ar:"أيام تحقيق الهدف", de:"Tage mit erreichtem Ziel", fr:"Jours objectif atteint", es:"Días con meta lograda", hi:"लक्ष्य पूरे दिन" },
  stat_urine_avg:  { he:"צבע שתן ממוצע (1–8)", en:"Average urine color (1–8)", ar:"متوسط لون البول (1–8)", de:"Durchschn. Urinfarbe (1–8)", fr:"Couleur d’urine moyenne (1–8)", es:"Color medio de orina (1–8)", hi:"औसत मूत्र रंग (1–8)" },
  stat_pain:       { he:"אירועי כאב", en:"Pain events", ar:"نوبات الألم", de:"Schmerzereignisse", fr:"Épisodes de douleur", es:"Episodios de dolor", hi:"दर्द की घटनाएँ" },
  report_title:    { he:"דוח לרופא המטפל", en:"Report for your doctor", ar:"تقرير للطبيب المعالج", de:"Bericht für deinen Arzt", fr:"Rapport pour votre médecin", es:"Informe para tu médico", hi:"आपके डॉक्टर के लिए रिपोर्ट" },
  report_sub:      { he:"סיכום 30 הימים האחרונים — להצגה בביקורת או לשליחה מראש", en:"Summary of the last 30 days — to show at a checkup or send ahead", ar:"ملخص آخر 30 يومًا — لعرضه في الفحص أو إرساله مسبقًا", de:"Zusammenfassung der letzten 30 Tage — für den Termin oder vorab", fr:"Résumé des 30 derniers jours — à montrer en consultation ou à envoyer", es:"Resumen de los últimos 30 días — para mostrar en la consulta o enviar", hi:"पिछले 30 दिनों का सारांश — जाँच में दिखाने या पहले भेजने के लिए" },
  copy_report:     { he:"העתקת הדוח", en:"Copy report", ar:"نسخ التقرير", de:"Bericht kopieren", fr:"Copier le rapport", es:"Copiar informe", hi:"रिपोर्ट कॉपी करें" },
  save_pdf:        { he:"שמירה כ־PDF / הדפסה", en:"Save as PDF / Print", ar:"حفظ كـ PDF / طباعة", de:"Als PDF speichern / Drucken", fr:"Enregistrer en PDF / Imprimer", es:"Guardar como PDF / Imprimir", hi:"PDF के रूप में सहेजें / प्रिंट करें" },
  disclaimer:      { he:"היישום מיועד לתיעוד ומעקב בלבד ואינו מהווה ייעוץ רפואי, אבחון או טיפול. יעדי השתייה נקבעים על ידי הרופא המטפל בלבד. במקרה של כאב חריף — פנה לקבלת טיפול רפואי.", en:"This app is for documentation and tracking only and is not medical advice, diagnosis or treatment. Drinking goals are set solely by your treating physician. In case of acute pain — seek medical care.", ar:"هذا التطبيق للتوثيق والمتابعة فقط ولا يشكل استشارة أو تشخيصًا أو علاجًا طبيًا. أهداف الشرب يحددها الطبيب المعالج وحده. في حال ألم حاد — اطلب الرعاية الطبية.", de:"Diese App dient nur der Dokumentation und ist keine medizinische Beratung, Diagnose oder Behandlung. Trinkziele legt allein dein behandelnder Arzt fest. Bei akuten Schmerzen — ärztliche Hilfe suchen.", fr:"Cette application sert uniquement au suivi et ne constitue pas un avis médical, un diagnostic ni un traitement. Les objectifs sont fixés par votre médecin. En cas de douleur aiguë — consultez.", es:"Esta app es solo para documentación y seguimiento y no es consejo médico, diagnóstico ni tratamiento. Las metas las fija solo tu médico. En caso de dolor agudo — busca atención médica.", hi:"यह ऐप केवल दस्तावेज़ीकरण और ट्रैकिंग के लिए है और चिकित्सा सलाह, निदान या उपचार नहीं है। लक्ष्य केवल आपके चिकित्सक तय करते हैं। तीव्र दर्द में — चिकित्सा सहायता लें।" },
  goal_title:      { he:"יעד יומי", en:"Daily goal", ar:"الهدف اليومي", de:"Tagesziel", fr:"Objectif quotidien", es:"Meta diaria", hi:"दैनिक लक्ष्य" },
  goal_sub2:       { he:"כמות השתייה היומית שנקבעה על ידי הרופא", en:"The daily drinking amount set by your doctor", ar:"كمية الشرب اليومية التي حددها طبيبك", de:"Die von deinem Arzt festgelegte Tagesmenge", fr:"La quantité quotidienne fixée par votre médecin", es:"La cantidad diaria fijada por tu médico", hi:"आपके डॉक्टर द्वारा तय दैनिक मात्रा" },
  save:            { he:"שמור", en:"Save", ar:"حفظ", de:"Speichern", fr:"Enregistrer", es:"Guardar", hi:"सहेजें" },
  cups_title:      { he:"גדלי כוסות", en:"Cup sizes", ar:"أحجام الأكواب", de:"Bechergrößen", fr:"Tailles de verre", es:"Tamaños de vaso", hi:"गिलास आकार" },
  cups_sub:        { he:"התאם את כפתורי השתייה המהירה (עד 8 גדלים, במ״ל)", en:"Customize the quick-drink buttons (up to 8 sizes, in ml)", ar:"خصّص أزرار الشرب السريع (حتى 8 أحجام، بالمل)", de:"Schnell-Trink-Tasten anpassen (bis zu 8 Größen, in ml)", fr:"Personnalisez les boutons rapides (jusqu’à 8 tailles, en ml)", es:"Personaliza los botones rápidos (hasta 8 tamaños, en ml)", hi:"त्वरित-पेय बटन अनुकूलित करें (8 आकार तक, मि.ली. में)" },
  add_size:        { he:"הוסף גודל", en:"Add size", ar:"أضف حجمًا", de:"Größe hinzufügen", fr:"Ajouter une taille", es:"Añadir tamaño", hi:"आकार जोड़ें" },
  new_cup_ph:      { he:"למשל 250", en:"e.g. 250", ar:"مثلاً 250", de:"z. B. 250", fr:"ex. 250", es:"p. ej. 250", hi:"जैसे 250" },
  save_cups:       { he:"שמירת הגדלים", en:"Save sizes", ar:"حفظ الأحجام", de:"Größen speichern", fr:"Enregistrer les tailles", es:"Guardar tamaños", hi:"आकार सहेजें" },
  rem_title:       { he:"תזכורות שתייה", en:"Drinking reminders", ar:"تذكيرات الشرب", de:"Trink-Erinnerungen", fr:"Rappels de boisson", es:"Recordatorios de bebida", hi:"पेय अनुस्मारक" },
  rem_sub:         { he:"קבל התראה כשלא שתית מספיק — גם כשהאפליקציה סגורה", en:"Get a “time to drink” notification when you haven't had enough — even when the app is closed", ar:"احصل على تنبيه «حان وقت الشرب» عندما لا تشرب كفايتك — حتى والتطبيق مغلق", de:"Erhalte eine „Zeit zu trinken“-Benachrichtigung — auch bei geschlossener App", fr:"Recevez une notification « il est temps de boire » — même app fermée", es:"Recibe un aviso de «hora de beber» — incluso con la app cerrada", hi:"पर्याप्त न पीने पर «पीने का समय» सूचना पाएँ — ऐप बंद होने पर भी" },
  rem_enable:      { he:"הפעל תזכורות", en:"Enable reminders", ar:"تفعيل التذكيرات", de:"Erinnerungen aktivieren", fr:"Activer les rappels", es:"Activar recordatorios", hi:"अनुस्मारक चालू करें" },
  rem_every:       { he:"כל", en:"Every", ar:"كل", de:"Alle", fr:"Toutes les", es:"Cada", hi:"हर" },
  rem_minutes:     { he:"דקות", en:"minutes", ar:"دقيقة", de:"Minuten", fr:"minutes", es:"minutos", hi:"मिनट" },
  rem_from:        { he:"משעה", en:"From hour", ar:"من الساعة", de:"Ab Stunde", fr:"De l’heure", es:"Desde la hora", hi:"घंटे से" },
  rem_to:          { he:"עד שעה", en:"to hour", ar:"إلى الساعة", de:"bis Stunde", fr:"à l’heure", es:"hasta la hora", hi:"घंटे तक" },
  save_rem:        { he:"שמירת התזכורות", en:"Save reminders", ar:"حفظ التذكيرات", de:"Erinnerungen speichern", fr:"Enregistrer les rappels", es:"Guardar recordatorios", hi:"अनुस्मारक सहेजें" },
  rem_note_active: { he:"התזכורות פעילות ✓", en:"Reminders are active ✓", ar:"التذكيرات مفعّلة ✓", de:"Erinnerungen aktiv ✓", fr:"Rappels activés ✓", es:"Recordatorios activos ✓", hi:"अनुस्मारक सक्रिय ✓" },
  rem_note_nosup:  { he:"הדפדפן הזה אינו תומך בתזכורות דחיפה.", en:"This browser doesn't support push reminders.", ar:"هذا المتصفح لا يدعم تذكيرات الدفع.", de:"Dieser Browser unterstützt keine Push-Erinnerungen.", fr:"Ce navigateur ne prend pas en charge les rappels push.", es:"Este navegador no admite recordatorios push.", hi:"यह ब्राउज़र पुश अनुस्मारक का समर्थन नहीं करता।" },
  rem_note_noperm: { he:"כדי לקבל תזכורות יש לאשר התראות בדפדפן.", en:"To receive reminders, allow notifications in the browser.", ar:"لتلقّي التذكيرات، اسمح بالإشعارات في المتصفح.", de:"Um Erinnerungen zu erhalten, Benachrichtigungen im Browser erlauben.", fr:"Pour recevoir des rappels, autorisez les notifications.", es:"Para recibir recordatorios, permite las notificaciones.", hi:"अनुस्मारक पाने के लिए ब्राउज़र में सूचनाएँ अनुमति दें।" },
  toast_added:     { he:"נוספו {ml} מ״ל", en:"Added {ml} ml", ar:"أُضيف {ml} مل", de:"{ml} ml hinzugefügt", fr:"{ml} ml ajoutés", es:"Se añadieron {ml} ml", hi:"{ml} मि.ली. जोड़ा" },
  toast_undo:      { he:"הרישום האחרון בוטל", en:"Last entry undone", ar:"تم التراجع عن آخر إدخال", de:"Letzter Eintrag rückgängig", fr:"Dernière saisie annulée", es:"Último registro deshecho", hi:"अंतिम प्रविष्टि पूर्ववत" },
  toast_deleted:   { he:"הרישום נמחק", en:"Entry deleted", ar:"تم حذف الإدخال", de:"Eintrag gelöscht", fr:"Saisie supprimée", es:"Registro borrado", hi:"प्रविष्टि हटाई गई" },
  toast_urine_ok:  { he:"צבע תקין — המשך כך", en:"Normal color — keep it up", ar:"لون طبيعي — واصِل", de:"Normale Farbe — weiter so", fr:"Couleur normale — continuez", es:"Color normal — sigue así", hi:"सामान्य रंग — जारी रखें" },
  toast_urine_drk: { he:"צבע כהה — כדאי לשתות עכשיו", en:"Dark color — better drink now", ar:"لون داكن — يُفضّل الشرب الآن", de:"Dunkle Farbe — besser jetzt trinken", fr:"Couleur foncée — buvez maintenant", es:"Color oscuro — mejor bebe ahora", hi:"गहरा रंग — अभी पीना बेहतर" },
  toast_pain:      { he:"אירוע הכאב תועד", en:"Pain event logged", ar:"تم تسجيل نوبة الألم", de:"Schmerzereignis erfasst", fr:"Épisode de douleur enregistré", es:"Episodio de dolor registrado", hi:"दर्द की घटना दर्ज" },
  toast_goal:      { he:"היעד עודכן", en:"Goal updated", ar:"تم تحديث الهدف", de:"Ziel aktualisiert", fr:"Objectif mis à jour", es:"Meta actualizada", hi:"लक्ष्य अपडेट हुआ" },
  toast_cups:      { he:"גדלי הכוסות נשמרו", en:"Cup sizes saved", ar:"تم حفظ أحجام الأكواب", de:"Bechergrößen gespeichert", fr:"Tailles enregistrées", es:"Tamaños guardados", hi:"गिलास आकार सहेजे गए" },
  toast_rem:       { he:"התזכורות נשמרו", en:"Reminders saved", ar:"تم حفظ التذكيرات", de:"Erinnerungen gespeichert", fr:"Rappels enregistrés", es:"Recordatorios guardados", hi:"अनुस्मारक सहेजे गए" },
  toast_copied:    { he:"הדוח הועתק", en:"Report copied", ar:"تم نسخ التقرير", de:"Bericht kopiert", fr:"Rapport copié", es:"Informe copiado", hi:"रिपोर्ट कॉपी हुई" },
  toast_copy_no:   { he:"ההעתקה אינה נתמכת — סמן והעתק ידנית", en:"Copy isn't supported — select and copy manually", ar:"النسخ غير مدعوم — حدّد وانسخ يدويًا", de:"Kopieren nicht unterstützt — manuell markieren und kopieren", fr:"Copie non prise en charge — sélectionnez et copiez", es:"Copia no admitida — selecciona y copia manualmente", hi:"कॉपी समर्थित नहीं — चुनकर मैन्युअल कॉपी करें" },
  cup_invalid:     { he:"הכנס גודל תקין (עד 3000 מ״ל)", en:"Enter a valid size (up to 3000 ml)", ar:"أدخل حجمًا صحيحًا (حتى 3000 مل)", de:"Gültige Größe eingeben (bis 3000 ml)", fr:"Entrez une taille valide (jusqu’à 3000 ml)", es:"Introduce un tamaño válido (hasta 3000 ml)", hi:"मान्य आकार दर्ज करें (3000 मि.ली. तक)" },
  cup_max8:        { he:"עד 8 גדלים", en:"Up to 8 sizes", ar:"حتى 8 أحجام", de:"Bis zu 8 Größen", fr:"Jusqu’à 8 tailles", es:"Hasta 8 tamaños", hi:"8 आकार तक" },
  cup_need_one:    { he:"צריך לפחות גודל אחד", en:"At least one size is needed", ar:"مطلوب حجم واحد على الأقل", de:"Mindestens eine Größe nötig", fr:"Au moins une taille requise", es:"Se necesita al menos un tamaño", hi:"कम से कम एक आकार आवश्यक" },
  calc_title:      { he:"מחשבון כמות מים", en:"Water intake calculator", ar:"حاسبة كمية الماء", de:"Wasserbedarf-Rechner", fr:"Calculateur d’hydratation", es:"Calculadora de hidratación", hi:"पानी की मात्रा कैलकुलेटर" },
  calc_sub:        { he:"הערכה כללית לפי גוף ואורח חיים — אינה ייעוץ רפואי; יעד הרופא גובר", en:"A general estimate from your body and lifestyle — not medical advice; your doctor's goal takes precedence", ar:"تقدير عام حسب جسمك ونمط حياتك — ليس نصيحة طبية؛ هدف الطبيب هو الأساس", de:"Grobe Schätzung nach Körper und Lebensstil — keine medizinische Beratung; das Ziel deines Arztes hat Vorrang", fr:"Estimation générale selon votre corps et mode de vie — pas un avis médical ; l’objectif du médecin prévaut", es:"Estimación general según tu cuerpo y estilo de vida — no es consejo médico; la meta de tu médico prevalece", hi:"आपके शरीर और जीवनशैली के आधार पर सामान्य अनुमान — चिकित्सा सलाह नहीं; डॉक्टर का लक्ष्य प्राथमिक है" },
  calc_weight:     { he:"משקל (ק״ג)", en:"Weight (kg)", ar:"الوزن (كغ)", de:"Gewicht (kg)", fr:"Poids (kg)", es:"Peso (kg)", hi:"वज़न (कि.ग्रा.)" },
  calc_height:     { he:"גובה (ס״מ)", en:"Height (cm)", ar:"الطول (سم)", de:"Größe (cm)", fr:"Taille (cm)", es:"Estatura (cm)", hi:"ऊँचाई (से.मी.)" },
  calc_age:        { he:"גיל", en:"Age", ar:"العمر", de:"Alter", fr:"Âge", es:"Edad", hi:"आयु" },
  calc_sex:        { he:"מין", en:"Sex", ar:"الجنس", de:"Geschlecht", fr:"Sexe", es:"Sexo", hi:"लिंग" },
  calc_sex_female: { he:"אישה", en:"Female", ar:"أنثى", de:"Weiblich", fr:"Femme", es:"Mujer", hi:"महिला" },
  calc_sex_male:   { he:"גבר", en:"Male", ar:"ذكر", de:"Männlich", fr:"Homme", es:"Hombre", hi:"पुरुष" },
  calc_optional:   { he:"גובה, גיל ומין — לא חובה, משפרים את הדיוק", en:"Height, age and sex — optional, improve accuracy", ar:"الطول والعمر والجنس — اختياري، لتحسين الدقة", de:"Größe, Alter und Geschlecht — optional, erhöhen die Genauigkeit", fr:"Taille, âge et sexe — facultatif, améliorent la précision", es:"Estatura, edad y sexo — opcional, mejoran la precisión", hi:"ऊँचाई, आयु और लिंग — वैकल्पिक, सटीकता बढ़ाते हैं" },
  calc_activity:   { he:"רמת פעילות", en:"Activity level", ar:"مستوى النشاط", de:"Aktivitätsniveau", fr:"Niveau d’activité", es:"Nivel de actividad", hi:"गतिविधि स्तर" },
  calc_act_low:    { he:"נמוכה (בעיקר ישיבה)", en:"Low (mostly sitting)", ar:"منخفض (جلوس غالبًا)", de:"Niedrig (meist sitzend)", fr:"Faible (surtout assis)", es:"Baja (mayormente sentado)", hi:"कम (ज्यादातर बैठना)" },
  calc_act_mid:    { he:"בינונית", en:"Moderate", ar:"متوسط", de:"Mittel", fr:"Modéré", es:"Moderada", hi:"मध्यम" },
  calc_act_high:   { he:"גבוהה (ספורט/עבודה פיזית)", en:"High (sport/physical work)", ar:"مرتفع (رياضة/عمل بدني)", de:"Hoch (Sport/körperlich)", fr:"Élevé (sport/travail physique)", es:"Alta (deporte/trabajo físico)", hi:"उच्च (खेल/शारीरिक कार्य)" },
  calc_climate:    { he:"אקלים", en:"Climate", ar:"المناخ", de:"Klima", fr:"Climat", es:"Clima", hi:"जलवायु" },
  calc_clim_temp:  { he:"ממוזג", en:"Temperate", ar:"معتدل", de:"Gemäßigt", fr:"Tempéré", es:"Templado", hi:"समशीतोष्ण" },
  calc_clim_hot:   { he:"חם", en:"Hot", ar:"حار", de:"Heiß", fr:"Chaud", es:"Caluroso", hi:"गर्म" },
  calc_calc:       { he:"חשב", en:"Calculate", ar:"احسب", de:"Berechnen", fr:"Calculer", es:"Calcular", hi:"गणना करें" },
  calc_result:     { he:"מומלץ: {low}–{high} ליטר ביום", en:"Recommended: {low}–{high} liters/day", ar:"موصى به: {low}–{high} لتر/يوم", de:"Empfohlen: {low}–{high} Liter/Tag", fr:"Recommandé : {low}–{high} litres/jour", es:"Recomendado: {low}–{high} litros/día", hi:"अनुशंसित: {low}–{high} लीटर/दिन" },
  calc_use:        { he:"השתמש כיעד שלי", en:"Use as my goal", ar:"استخدمه كهدفي", de:"Als mein Ziel übernehmen", fr:"Utiliser comme objectif", es:"Usar como mi meta", hi:"मेरे लक्ष्य के रूप में उपयोग करें" },
  calc_note_stone: { he:"למניעת אבני כליות ממליצים לרוב על שתייה מוגברת — פעל לפי הנחיית הרופא.", en:"For kidney-stone prevention a higher intake is usually advised — follow your doctor's instruction.", ar:"للوقاية من حصى الكلى يُنصح عادةً بشرب أكثر — اتبع إرشادات طبيبك.", de:"Zur Nierenstein-Vorbeugung wird meist mehr Trinken empfohlen — folge deinem Arzt.", fr:"Pour prévenir les calculs rénaux, il est souvent conseillé de boire davantage — suivez votre médecin.", es:"Para prevenir cálculos renales suele aconsejarse beber más — sigue a tu médico.", hi:"गुर्दे की पथरी की रोकथाम के लिए आमतौर पर अधिक पानी की सलाह — डॉक्टर का पालन करें।" },
  calc_need_weight:{ he:"הכנס משקל תקין", en:"Enter a valid weight", ar:"أدخل وزنًا صحيحًا", de:"Gültiges Gewicht eingeben", fr:"Entrez un poids valide", es:"Introduce un peso válido", hi:"मान्य वज़न दर्ज करें" },
  ad_label:        { he:"פרסומת", en:"Advertisement", ar:"إعلان", de:"Werbung", fr:"Publicité", es:"Publicidad", hi:"विज्ञापन" },
  ad_placeholder:  { he:"מקום לפרסומת", en:"Ad space", ar:"مساحة إعلانية", de:"Anzeigenplatz", fr:"Espace publicitaire", es:"Espacio publicitario", hi:"विज्ञापन स्थान" },
  language:        { he:"שפה", en:"Language", ar:"اللغة", de:"Sprache", fr:"Langue", es:"Idioma", hi:"भाषा" },
  // server error codes
  err_fill_fields: { he:"יש למלא שם, אימייל וסיסמה בת 6 תווים לפחות", en:"Fill in name, email and a password of at least 6 characters", ar:"املأ الاسم والبريد وكلمة مرور من 6 أحرف على الأقل", de:"Name, E-Mail und Passwort (mind. 6 Zeichen) eingeben", fr:"Renseignez nom, e-mail et un mot de passe d’au moins 6 caractères", es:"Rellena nombre, correo y una contraseña de al menos 6 caracteres", hi:"नाम, ईमेल और कम से कम 6 अक्षर का पासवर्ड भरें" },
  err_email_taken: { he:"כתובת האימייל כבר רשומה", en:"This email is already registered", ar:"هذا البريد مسجّل بالفعل", de:"Diese E-Mail ist bereits registriert", fr:"Cet e-mail est déjà enregistré", es:"Este correo ya está registrado", hi:"यह ईमेल पहले से पंजीकृत है" },
  err_bad_creds:   { he:"אימייל או סיסמה שגויים", en:"Wrong email or password", ar:"البريد أو كلمة المرور غير صحيحة", de:"Falsche E-Mail oder Passwort", fr:"E-mail ou mot de passe incorrect", es:"Correo o contraseña incorrectos", hi:"गलत ईमेल या पासवर्ड" },
  err_rate:        { he:"יותר מדי ניסיונות — נסה שוב בעוד מספר דקות", en:"Too many attempts — try again in a few minutes", ar:"محاولات كثيرة — أعد المحاولة بعد دقائق", de:"Zu viele Versuche — in einigen Minuten erneut", fr:"Trop de tentatives — réessayez dans quelques minutes", es:"Demasiados intentos — reinténtalo en unos minutos", hi:"बहुत अधिक प्रयास — कुछ मिनटों में पुनः प्रयास करें" },
  err_generic:     { he:"שגיאה בשרת", en:"Server error", ar:"خطأ في الخادم", de:"Serverfehler", fr:"Erreur serveur", es:"Error del servidor", hi:"सर्वर त्रुटि" },
};

let currentLang = "he";

function detectLang() {
  const saved = localStorage.getItem("litho-lang");
  if (saved && LANGS.some((l) => l.code === saved)) return saved;
  const nav = (navigator.language || "he").slice(0, 2).toLowerCase();
  return LANGS.some((l) => l.code === nav) ? nav : "he";
}

function t(key, vars) {
  const row = TR[key];
  let s = row ? (row[currentLang] ?? row.en ?? key) : key;
  if (vars) for (const k in vars) s = s.replaceAll("{" + k + "}", vars[k]);
  return s;
}

const langMeta = () => LANGS.find((l) => l.code === currentLang) || LANGS[0];
const currentLocale = () => langMeta().locale;

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  document.querySelectorAll("[data-i18n-brand]").forEach((el) => {
    el.textContent = t("brand_unit");
  });
  const meta = langMeta();
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
  document.title = "2.5" + t("brand_unit") + " — " + t("app_subtitle");
}

function setLang(code) {
  if (!LANGS.some((l) => l.code === code)) return;
  currentLang = code;
  localStorage.setItem("litho-lang", code);
  applyStaticTranslations();
  if (typeof onLangChanged === "function") onLangChanged();
}

function initLangSelector(selectEl) {
  selectEl.innerHTML = "";
  LANGS.forEach((l) => {
    const o = document.createElement("option");
    o.value = l.code;
    o.textContent = l.name;
    selectEl.appendChild(o);
  });
  selectEl.value = currentLang;
  selectEl.onchange = () => setLang(selectEl.value);
}

currentLang = detectLang();
