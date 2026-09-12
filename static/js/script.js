// ==========================================================================
// Nour AI — shared front-end behavior
// Kept framework-free on purpose: safe to drop into any Django template
// (base.html) without fighting Django's own static/templating pipeline.
// ==========================================================================

// ---------- Safe storage wrapper ----------
// Some browsers (Edge Tracking Prevention, Safari ITP, private mode) block
// localStorage and THROW on getItem/setItem instead of just failing quietly.
// Without this wrapper, that throw stops the rest of the function — which is
// why the theme/language toggles could silently do nothing on some pages.
// This falls back to an in-memory object so the UI still updates even when
// nothing can be persisted between page loads.
const safeStorage = (function () {
    let memory = {};
    let storageOK = true;
    try {
        const testKey = '__nour_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
    } catch (e) {
        storageOK = false;
    }
    return {
        get(key) {
            if (storageOK) {
                try { return window.localStorage.getItem(key); } catch (e) { /* fall through */ }
            }
            return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
        },
        set(key, value) {
            memory[key] = value;
            if (storageOK) {
                try { window.localStorage.setItem(key, value); } catch (e) { /* memory fallback already set */ }
            }
        }
    };
})();

// ---------- Theme (light/dark) ----------
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('#themeToggleBtn i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    safeStorage.set('nour-theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

(function initTheme() {
    const saved = safeStorage.get('nour-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
})();

// ---------- Language (ar / en) ----------
// data-translate on any element + a matching key below controls the swap.
// Backend note: if you'd rather drive this from Django (django.po / i18n),

// this whole block can be deleted and replaced with {% trans %} tags —
// the markup already carries data-translate="key" as a ready-made map.
const translations = {
    ar: {
        nav_home: 'الرئيسية',
        nav_dashboard: 'لوحة التحكم',
        nav_resources: 'المصادر',
        nav_about: 'حول الذكاء الاصطناعي',
        btn_start_conv: 'ابدأ محادثة',
        btn_how_it_works: 'كيف يعمل',
        hero_title: 'Nour AI: مساحة آمنة للتحدث<br>والتأمل',
        hero_subtitle: 'Nour AI يستخدم الذكاء الاصطناعي لتقديم محادثات متعاطفة ودعم نفسي وقتما تحتاجه',
        trust_enc: 'تشفير كامل للمحادثات',
        trust_human: 'ذكاء اصطناعي محوره الإنسان',
        trust_arabic: 'يفهم العربية بلهجاتها',
        trust_hipaa: 'مبني على معايير الخصوصية أولاً',
        sec_features_title: 'مصمم لدعم صحتك النفسية',
        sec_features_subtitle: 'ميزات ذكية، خصوصية مطلقة، ودعم لا يتوقف',
        card1_title: 'فهم اللغة<br>العربية',
        card1_desc: 'يدعم اللغة العربية بلهجاتها المختلفة لضمان تجربة طبيعية وسلسة دون حواجز لغوية.',
        card1_learn: 'اعرفي أكتر',
        card2_title: 'دعم عاطفي بالذكاء الاصطناعي',
        card2_desc: 'خوارزميات متطورة تفهم نبرة صوتك ومشاعرك لتقديم استجابات متعاطفة ومخصصة تساعدك على تجاوز اللحظات الصعبة.',
        card3_title: 'تجربة دعم مخصصة',
        card3_desc: 'يتعلم Nour AI من تفاعلاتك ليصمم لك رحلة دعم مخصصة تناسب احتياجاتك الفريدة وطريقة تفاعلك مع المساعد.',
        card4_title: 'محادثات خاصة وآمنة',
        card4_desc: 'خصوصيتك هي أولويتنا القصوى. يتم تشفير جميع المحادثات وحذفها تلقائياً لضمان سرية تامة.',
        cta_title: 'هل أنت مستعد للبدء؟',
        cta_subtitle: 'انضم إلينا اليوم وابدأ رحلتك مع Nour AI. محادثتك الأولى تبدأ هنا.',
        btn_cta_start: 'ابدأ المحادثة الآن',
        mockup_status: 'متصل الآن',
        mockup_msg1: 'مرحبا، كيف بتحسي اليوم؟',
        mockup_msg2: 'حاسة إني متوترة شوي من الشغل',
        mockup_msg3: 'فهمتك، خلينا ناخد نفس عميق سوا. احكيلي أكتر شو اللي متعبك',
        mockup_placeholder: 'اكتب رسالتك...',
        footer_contact: 'تواصل مع الدعم',
        footer_terms: 'شروط الاستخدام',
        footer_privacy: 'سياسة الخصوصية',
        terms_title: 'شروط الاستخدام',
        terms_subtitle: 'متى تستخدم Nour AI، وكيف، وما الذي يمكن أن تتوقعه',
        terms_1_title: 'المساحة التي نقدمها',
        terms_1_text: 'Nour AI هو رفيق محادثة يعمل بالذكاء الاصطناعي، مصمم لتقديم دعم عاطفي ومساحة آمنة للتحدث. المحادثات هنا تتم مع الذكاء الاصطناعي وليست مع أخصائي بشري.',
        terms_2_title: 'ليس بديلاً عن الرعاية المهنية',
        terms_2_text: 'Nour AI هو أداة دعم ورفقة، وليس بديلاً عن استشارة مختص نفسي أو طبيب مرخّص، ولا يُستخدم كأداة للتشخيص أو العلاج أو حالات الطوارئ. إذا كنت تواجه أزمة أو خطراً مباشراً، يرجى التواصل فوراً مع جهة مختصة أو خدمات الطوارئ المحلية.',
        terms_3_title: 'استخدامك للخدمة',
        terms_3_text: 'باستخدامك Nour AI، فإنك توافق على استخدام الخدمة بطريقة مسؤولة ومحترمة، وعدم مشاركة محتوى ضار أو مسيء أو غير قانوني. نحتفظ بحق تقييد الوصول إلى الخدمة عند إساءة الاستخدام.',
        terms_4_title: 'الخصوصية والبيانات',
        terms_4_text: 'نأخذ خصوصيتك على محمل الجد. لمزيد من التفاصيل حول كيفية معالجة بياناتك ومحادثاتك، يرجى الاطلاع على سياسة الخصوصية الخاصة بنا.',
        terms_5_title: 'الوصول والتوفر',
        terms_5_text: 'نعمل على إبقاء الخدمة متاحة وموثوقة، لكننا لا نضمن توفراً مستمراً أو تاماً، وقد تتوقف الخدمة مؤقتاً للصيانة أو التحديثات دون إشعار مسبق.',
        terms_6_title: 'التعديلات',
        terms_6_text: 'قد نحدّث هذه الشروط من وقت لآخر لتعكس تغييرات في الخدمة أو المتطلبات القانونية. استمرارك في استخدام الخدمة بعد التحديثات يعني قبولك للشروط المحدثة. آخر تحديث لهذه الصفحة: سنة 2026.',
        terms_7_title: 'التواصل معنا',
        terms_7_text: 'إذا كان لديك أي سؤال حول شروط الاستخدام هذه، فلا تتردد في التواصل معنا من خلال صفحة المصادر أو الدعم.',
        privacy_title: 'سياسة الخصوصية',
        privacy_subtitle: 'كيف نتعامل مع بياناتك ومحادثاتك بمساحة دعم الصحة النفسية',
        privacy_1_title: 'نلتزم بخصوصيتك',
        privacy_1_text: 'مساحة Nour AI مبنية على الثقة. بدعمنا للصحة النفسية، ندرك حساسية محادثاتك ونلتزم بالتعامل معها بعناية فائقة وشفافية كاملة. لا نبيع بياناتك إطلاقاً.',
        privacy_2_title: 'البيانات التي نجمعها',
        privacy_2_text: 'نجمع فقط الحد الأدنى من البيانات اللازمة لتشغيل الخدمة: نصوص المحادثات التي تشاركها معنا، وبعض بيانات الاستخدام الأساسية مثل الجلسات وحالة مزاجك عند تسجيلها عبر لوحة التحكم.',
        privacy_3_title: 'كيف نستخدم محادثاتك',
        privacy_3_text: 'تُستخدم محادثاتك لتوليد ردود داعمة ومخصصة، وتحسين تجربتك مع الذكاء الاصطناعي. لا نشارك محتوى محادثاتك مع أطراف ثالثة لأغراض تسويقية أو غيرها، دون موافقتك الصريحة.',
        privacy_4_title: 'حماية البيانات والأمان',
        privacy_4_text: 'نتخذ تدابير أمان معقولة لحماية بياناتك، من ضمنها تشفير النقل والحد من الوصول إلى البيانات. نظراً للطبيعة الحساسة لمساحة الدعم النفسي، نعمل على الاحتفاظ بالحد الأدنى من البيانات اللازمة فقط.',
        privacy_5_title: 'مشاركة البيانات مع مزودي الخدمة',
        privacy_5_text: 'يعمل Nour AI عبر مزودي خدمات تقنية موثوقين (مثل منصات الذكاء الاصطناعي) لمعالجة طلبات المحادثة، ويتم التعامل مع هذه البيانات وفق شروطهم وبأقل قدر ممكن. لا نشارك بيانات تحدد هويتك مع جهات خارجية إلا عند الاقتضاء القانوني.',
        privacy_6_title: 'نصيحة حول المحتوى الحساس',
        privacy_6_text: 'رغم أن مساحتنا آمنة، ننصحك بعدم مشاركة معلومات تعريفية حساسة مثل الأرقام الشخصية أو التفاصيل الكاملة التي قد تعرّضك للخطر، خاصة في المحادثات المتعلقة بالصحة النفسية.',
        privacy_7_title: 'حقوقك واختياراتك',
        privacy_7_text: 'تحتفظ بالحق في طلب معلومات حول البيانات المحتفظ بها المتعلقة بك، أو طلب تحديثها أو حذفها وفق ما هو متاح تقنياً وقانونياً.',
        privacy_8_title: 'التحديثات والتواصل',
        privacy_8_text: 'قد نحدّث سياسة الخصوصية من وقت لآخر، وسيظهر أي تحديث في هذه الصفحة. إذا كان لديك أي سؤال حول هذه السياسة، يمكنك التواصل معنا عبر صفحة المصادر أو الدعم. آخر تحديث: سنة 2026.',

        dash_title: 'أهلاً بك من جديد 👋',
        dash_subtitle: 'هيك عم تتطور رحلتك مع Nour AI هالأسبوع',
        stat1_label: 'جلسات هالشهر',
        stat1_trend: 'أكتر بـ 3 عن الشهر الماضي',
        stat2_label: 'أيام متتالية',
        stat2_trend: 'استمر هيك',
        stat3_label: 'مستوى الاستقرار',
        stat3_value: 'جيد',
        stat3_trend: 'تحسّن ملحوظ',
        mood_title: 'كيف حاسس اليوم؟',
        mood_subtitle: 'اختار الحالة الأقرب لمشاعرك الحالية',
        mood_bad: 'صعب',
        mood_stressed: 'متوتر',
        mood_okay: 'عادي',
        mood_good: 'مرتاح',
        mood_great: 'ممتاز',
        session_title: 'آخر الجلسات',
        session1_title: 'محادثة حول ضغط الشغل',
        session1_date: 'اليوم، 9:40 ص',
        session2_title: 'تمرين تنفس واسترخاء',
        session2_date: 'أمس، 8:15 م',
        session3_title: 'محادثة حول النوم',
        session3_date: 'قبل يومين',
        session_view_all: 'عرض كل الجلسات',
        reminders_title: 'تذكيرات لطيفة',
        reminder1: 'خذ وقتك، اشرب مي وارتاح شوي',
        reminder2: 'حاول تنام بوقت ثابت هالأسبوع',
        reminder3: 'ما ضيعت محادثتك اليومية بعد',

        chat_greeting: 'أهلاً فيك 🌙 أنا Nour، منستطيع نحكي هون بكل خصوصية وأمان. كيف حابة تبلّشي اليوم؟',
        chat_greeting_time: '9:12 ص',
        chat_input_placeholder: 'اكتبي شو عم تحسي فيه...',
        chat_disclaimer: 'Nour AI رفيق داعم، مش بديل عن استشارة مختص نفسي عند الحاجة',
        chat_bot_reply: 'شكراً إنك شاركتني هيك. احكيلي أكتر، أنا هون منستمعلك.',

        res_title: 'مصادر ودعم',
        res_subtitle: 'مقالات ونصائح ودعم فوري عند الحاجة',
        res1_tag: 'القلق', res1_title: '5 طرق للتعامل مع نوبات القلق', res1_desc: 'تمارين تنفس وتقنيات تأريض بسيطة تقدري تستخدميها بأي لحظة.',
        res2_tag: 'النوم', res2_title: 'روتين مسائي يحسّن نوعية نومك', res2_desc: 'خطوات بسيطة قبل النوم بساعة توصلك لنوم أعمق وأهدأ.',
        res3_tag: 'ضغط الشغل', res3_title: 'كيف تحط حدود صحية بشغلك', res3_desc: 'التعرف على علامات الاحتراق الوظيفي والتعامل معها بدري.',
        res4_tag: 'العلاقات', res4_title: 'التواصل الفعّال مع من حولك', res4_desc: 'طرق للتعبير عن مشاعرك بوضوح دون خوف من الحكم عليك.',
        res5_tag: 'التأمل', res5_title: 'تمرين تأمل موجّه لمدة 10 دقائق', res5_desc: 'جلسة قصيرة تساعدك ترجع لمركزك بأي وقت من اليوم.',
        res6_tag: 'تقدير الذات', res6_title: 'وقف عن جلد الذات: خطوات عملية', res6_desc: 'كيف تلاحظ حديثك الداخلي القاسي وتستبدله بتعاطف حقيقي.',
        res_read_more: 'اقرأي المزيد',
        emergency_title: 'محتاج مساعدة فورية؟',
        emergency_text: 'إذا كنت بأزمة أو خطر مباشر، لا تترد بالتواصل مع جهة مختصة بأقرب وقت.',
        emergency_btn1: 'خط الدعم النفسي',
        emergency_btn2: 'تواصل مع مختص',

        about_title: 'كيف يشتغل Nour AI؟',
        about_subtitle: 'تعرف على الفكرة من ورا التجربة، وليش نثق فيها',
        about_intro_title: 'مو بديل عن العلاج، رفيق أول خطوة',
        about_intro_text: 'Nour AI مصمم ليكون مساحة أولى تحكي فيها براحتك قبل ما توصلي لمختص، أو بين جلسة وجلسة. كل رد بيتبنى بعناية عشان يكون داعم وواقعي، مش عام أو جاهز.',
        about_step1_title: 'أحكي بحرية',
        about_step1_desc: 'تبدأ المحادثة بلهجتك الطبيعية، بدون خوف من الحكم أو التقييم.',
        about_step2_title: 'يفهم ويستجيب',
        about_step2_desc: 'النموذج مبني بتوجيه دقيق (prompt engineering) يخليه يفهم السياق والمشاعر بدل ردود جاهزة.',
        about_step3_title: 'يبقى بينكم بس',
        about_step3_desc: 'محادثاتك مشفرة وخاصة، وما بتنشارك مع أي طرف تالت.',
        about_cta_title: 'جاهز تجربي؟',
        about_cta_subtitle: 'أول محادثة بتاخد أقل من دقيقة تبدأها',
        about_cta_btn: 'ابدأ المحادثة الآن',
    },
    en: {
        nav_home: 'Home',
        nav_dashboard: 'Dashboard',
        nav_resources: 'Resources',
        nav_about: 'About the AI',
        btn_start_conv: 'Start Conversation',
        btn_how_it_works: 'How it works',
        hero_title: 'Nour AI: a safe space to talk<br>and reflect',
        hero_subtitle: 'Nour AI uses artificial intelligence to provide empathetic conversations and emotional support whenever you need it',
        trust_enc: 'End-to-end Encryption',
        trust_human: 'Human-centered AI',
        trust_arabic: 'Arabic Native',
        trust_hipaa: 'Built with Privacy-First Standards',
        sec_features_title: 'Designed to support your mental health',
        sec_features_subtitle: 'Smart features, absolute privacy, and support that never stops',
        card1_title: 'Arabic Language<br>Understanding',
        card1_desc: 'Understands Arabic across its many dialects, for a natural experience with no language barrier.',
        card1_learn: 'Learn more',
        card2_title: 'AI Emotional Support',
        card2_desc: 'Advanced algorithms read your tone and emotions to give empathetic, personalized responses that help you through hard moments.',
        card3_title: 'Personalized Support Experience',
        card3_desc: 'Nour AI learns from your interactions to shape a support journey suited to your unique needs and style.',
        card4_title: 'Private and Secure Conversations',
        card4_desc: 'Your privacy is our top priority. Every conversation is encrypted and auto-deleted to guarantee full confidentiality.',
        cta_title: 'Ready to get started?',
        cta_subtitle: 'Join us today and start your journey with Nour AI. Your first conversation starts here.',
        btn_cta_start: 'Start Conversation Now',
        mockup_status: 'Online now',
        mockup_msg1: 'Hi, how are you feeling today?',
        mockup_msg2: "I'm feeling a bit stressed from work",
        mockup_msg3: "I hear you. Let's take a deep breath together. Tell me more about what's tiring you out",
        mockup_placeholder: 'Type your message...',
        footer_contact: 'Contact Support',
        footer_terms: 'Terms of Service',
        footer_privacy: 'Privacy Policy',
        terms_title: 'Terms of Service',
        terms_subtitle: 'When and how to use Nour AI, and what to expect',
        terms_1_title: 'The space we offer',
        terms_1_text: 'Nour AI is an AI-powered conversation companion designed to provide emotional support and a safe space to talk. Conversations here happen with the AI, not with a human specialist.',
        terms_2_title: 'Not a substitute for professional care',
        terms_2_text: "Nour AI is a support and companionship tool, not a substitute for consultation with a licensed mental health professional or doctor, and is not used as a tool for diagnosis, treatment, or emergencies. If you are in crisis or immediate danger, please reach out immediately to a qualified service or local emergency services.",
        terms_3_title: 'Your use of the service',
        terms_3_text: 'By using Nour AI, you agree to use the service responsibly and respectfully, and not to share harmful, abusive, or unlawful content. We reserve the right to restrict access to the service in cases of misuse.',
        terms_4_title: 'Privacy and data',
        terms_4_text: 'We take your privacy seriously. For more details on how we handle your data and conversations, please see our Privacy Policy.',
        terms_5_title: 'Access and availability',
        terms_5_text: "We work to keep the service available and reliable, but we do not guarantee uninterrupted or complete availability, and the service may pause temporarily for maintenance or updates without prior notice.",
        terms_6_title: 'Changes',
        terms_6_text: 'We may update these terms from time to time to reflect changes in the service or legal requirements. Your continued use of the service after updates means you accept the updated terms. Last updated: 2026.',
        terms_7_title: 'Contact us',
        terms_7_text: 'If you have any questions about these terms of service, feel free to reach out to us through the Resources or support page.',
        privacy_title: 'Privacy Policy',
        privacy_subtitle: 'How we handle your data and conversations in a mental-health support space',
        privacy_1_title: 'We are committed to your privacy',
        privacy_1_text: 'The Nour AI space is built on trust. As a mental-health support platform, we understand the sensitivity of your conversations and are committed to handling them with utmost care and full transparency. We never sell your data.',
        privacy_2_title: 'Data we collect',
        privacy_2_text: 'We collect only the minimum data needed to run the service: the conversation texts you share with us, and some basic usage data such as sessions and your mood entries when logged via the dashboard.',
        privacy_3_title: 'How we use your conversations',
        privacy_3_text: 'Your conversations are used to generate supportive, personalized responses and improve your experience with the AI. We do not share the content of your conversations with third parties for marketing or other purposes without your explicit consent.',
        privacy_4_title: 'Data protection and security',
        privacy_4_text: 'We take reasonable security measures to protect your data, including encryption of transfer and restricting access to data. Given the sensitive nature of a mental-health support space, we aim to retain only the minimum data needed.',
        privacy_5_title: 'Sharing data with service providers',
        privacy_5_text: 'Nour AI works through trusted technical providers (such as AI platforms) to process conversation requests, and this data is handled under their terms and to the minimum extent possible. We do not share identifying data with outside parties except where legally required.',
        privacy_6_title: 'A note on sensitive content',
        privacy_6_text: 'Even though our space is safe, we advise you not to share sensitive identifying information such as personal numbers or full details that could put you at risk, especially in conversations related to mental health.',
        privacy_7_title: 'Your rights and choices',
        privacy_7_text: 'You have the right to request information about the data we hold about you, or to request updates or deletion where technically and legally feasible.',
        privacy_8_title: 'Updates and contact',
        privacy_8_text: 'We may update this privacy policy from time to time, and any update will appear on this page. If you have any questions about this policy, you can reach us through the Resources or support page. Last updated: 2026.',

        dash_title: 'Welcome back 👋',
        dash_subtitle: "Here's how your journey with Nour AI is progressing this week",
        stat1_label: 'Sessions this month',
        stat1_trend: '3 more than last month',
        stat2_label: 'Day streak',
        stat2_trend: 'Keep it up',
        stat3_label: 'Stability level',
        stat3_value: 'Good',
        stat3_trend: 'Noticeable improvement',
        mood_title: 'How are you feeling today?',
        mood_subtitle: 'Pick the state closest to how you feel right now',
        mood_bad: 'Difficult',
        mood_stressed: 'Stressed',
        mood_okay: 'Okay',
        mood_good: 'Good',
        mood_great: 'Great',
        session_title: 'Recent sessions',
        session1_title: 'Conversation about work stress',
        session1_date: 'Today, 9:40 AM',
        session2_title: 'Breathing and relaxation exercise',
        session2_date: 'Yesterday, 8:15 PM',
        session3_title: 'Conversation about sleep',
        session3_date: '2 days ago',
        session_view_all: 'View all sessions',
        reminders_title: 'Gentle reminders',
        reminder1: 'Take your time — drink some water and rest a bit',
        reminder2: 'Try keeping a consistent bedtime this week',
        reminder3: "You haven't had your daily conversation yet",

        chat_greeting: "Hi 🌙 I'm Nour. We can talk here in complete privacy and safety. How would you like to start today?",
        chat_greeting_time: '9:12 AM',
        chat_input_placeholder: "Type what you're feeling...",
        chat_disclaimer: "Nour AI is a supportive companion, not a substitute for professional mental health care when you need it",
        chat_bot_reply: "Thank you for sharing that with me. Tell me more, I'm here to listen.",

        res_title: 'Resources & Support',
        res_subtitle: 'Articles, tips, and immediate support when you need it',
        res1_tag: 'Anxiety', res1_title: '5 ways to handle anxiety attacks', res1_desc: 'Simple breathing and grounding techniques you can use at any moment.',
        res2_tag: 'Sleep', res2_title: 'An evening routine for better sleep quality', res2_desc: 'Simple steps an hour before bed for deeper, calmer sleep.',
        res3_tag: 'Work stress', res3_title: 'How to set healthy boundaries at work', res3_desc: 'Recognizing burnout signs early and dealing with them.',
        res4_tag: 'Relationships', res4_title: 'Communicating effectively with those around you', res4_desc: 'Ways to express your feelings clearly without fear of judgment.',
        res5_tag: 'Meditation', res5_title: 'A guided 10-minute meditation exercise', res5_desc: 'A short session to help you re-center at any point in your day.',
        res6_tag: 'Self-esteem', res6_title: 'Stop the self-criticism: practical steps', res6_desc: 'How to notice harsh self-talk and replace it with real self-compassion.',
        res_read_more: 'Read more',
        emergency_title: 'Need immediate help?',
        emergency_text: "If you're in crisis or immediate danger, don't hesitate to reach out to a professional as soon as possible.",
        emergency_btn1: 'Support hotline',
        emergency_btn2: 'Contact a specialist',

        about_title: 'How does Nour AI work?',
        about_subtitle: "Learn about the idea behind the experience, and why you can trust it",
        about_intro_title: 'Not a replacement for therapy — a companion for the first step',
        about_intro_text: 'Nour AI is designed as a first space to talk freely, before reaching a specialist or between sessions. Every reply is crafted carefully to be supportive and real, never generic or canned.',
        about_step1_title: 'Talk freely',
        about_step1_desc: 'Start the conversation in your own natural dialect, without fear of judgment.',
        about_step2_title: 'It understands and responds',
        about_step2_desc: 'The model is built through careful prompt engineering so it understands context and emotion instead of giving canned replies.',
        about_step3_title: 'It stays between you two',
        about_step3_desc: "Your conversations are encrypted and private, and never shared with any third party.",
        about_cta_title: 'Ready to try it?',
        about_cta_subtitle: 'Your first conversation takes less than a minute to start',
        about_cta_btn: 'Start Conversation Now',
    }
};

function applyLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach((el) => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-translate-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });

    // ---- Generic fallback: catches any text NOT wrapped in data-translate ----
    // Builds an exact-match table (Arabic phrase <-> English phrase) from the
    // same dictionary above, then walks every text node on the page and swaps
    // any node whose trimmed text exactly matches a known phrase. This means
    // cards/sections that don't carry a data-translate attribute still get
    // translated, with zero HTML changes required.
    const arToEn = {};
    const enToAr = {};
    Object.keys(translations.ar).forEach((key) => {
        const arText = (translations.ar[key] || '').replace(/<br\s*\/?>/gi, ' ').trim();
        const enText = (translations.en[key] || '').replace(/<br\s*\/?>/gi, ' ').trim();
        if (arText && enText) {
            arToEn[arText] = enText;
            enToAr[enText] = arText;
        }
    });
    // Extra alternate phrasings — same meaning, slightly different wording
    // (e.g. some repeated "read more" links were left feminine, others made
    // masculine/neutral). Add pairs here any time a phrase has more than
    // one form in the actual HTML.
    const extraPairs = [
        ['اقرأ المزيد', 'Read more'],
        ['5طرق للتعامل مع نوبات القلق', '5 ways to handle anxiety attacks'],
        ['أهلاً فيك 🌙 أنا Nour AI، منستطيع نحكي هون بكل خصوصية وأمان. كيف حابب تبلّش اليوم؟', "Welcome 🌙 I'm Nour AI, we can talk here in full privacy and safety. How would you like to start today?"],
        ['Nour AI رفيق داعم، مش بديل عن استشارة مختص نفسي عند الحاجة', 'Nour AI is a supportive companion, not a substitute for professional mental health care when needed.'],
        // قيم مستوى الاستقرار الجاية من calculate_stability() بالـ view (نص عادي، بدون data-translate)
        ['ممتاز', 'Excellent'],
        ['متوسط', 'Average'],
        ['بحاجة لدعم', 'Needs support'],
        ['لا يوجد بيانات كافية', 'Not enough data yet'],
    ];
    const extraPlaceholderPairs = [
        ['اكتب شو عم تحس فيه...', "Write what you're feeling..."],
    ];
    extraPairs.forEach(([ar, en]) => {
        arToEn[ar] = en;
        enToAr[en] = ar;
    });
    const placeholderArToEn = {};
    const placeholderEnToAr = {};
    extraPlaceholderPairs.forEach(([ar, en]) => {
        placeholderArToEn[ar] = en;
        placeholderEnToAr[en] = ar;
    });
    const placeholderLookup = lang === 'en' ? placeholderArToEn : placeholderEnToAr;
    document.querySelectorAll('input[placeholder]').forEach((el) => {
        const current = el.getAttribute('placeholder');
        if (placeholderLookup[current]) {
            el.setAttribute('placeholder', placeholderLookup[current]);
        }
    });
    const lookup = lang === 'en' ? arToEn : enToAr;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parentTag = node.parentElement ? node.parentElement.tagName : '';
            if (parentTag === 'SCRIPT' || parentTag === 'STYLE') return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach((n) => {
        const trimmed = n.nodeValue.trim();
        if (trimmed && lookup[trimmed]) {
            n.nodeValue = n.nodeValue.replace(trimmed, lookup[trimmed]);
        }
    });

    const langBtn = document.querySelector('.lang-toggle-text');
    if (langBtn) langBtn.textContent = lang === 'ar' ? 'English' : 'عربي';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    safeStorage.set('nour-lang', lang);
}

function toggleLanguage() {
    const current = safeStorage.get('nour-lang') || 'ar';
    applyLanguage(current === 'ar' ? 'en' : 'ar');
}

(function initLanguage() {
    const saved = safeStorage.get('nour-lang') || 'ar';
    if (saved !== 'ar') applyLanguage(saved);
})();

// ---------- Chat page: real AI send interaction ----------
// Sends the message + conversation history to POST /api/chat/, which talks
// to the prompt-engineered Gemini model (see chatbot/services.py).
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function initChatPage() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const window_ = document.getElementById('chatWindow');
    if (!form || !input || !window_) return;

    const history = [];

    function addMessage(text, who) {
        const bubble = document.createElement('div');
        bubble.className = `msg ${who === 'user' ? 'msg-user' : 'msg-bot'}`;
        bubble.textContent = text;
        window_.appendChild(bubble);
        window_.scrollTop = window_.scrollHeight;
    }

    function showTyping() {
        const t = document.createElement('div');
        t.className = 'typing-indicator';
        t.id = 'typingIndicator';
        t.innerHTML = '<span></span><span></span><span></span>';
        window_.appendChild(t);
        window_.scrollTop = window_.scrollHeight;
    }

    function hideTyping() {
        const t = document.getElementById('typingIndicator');
        if (t) t.remove();
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';
        showTyping();

        const payload = {
            message: text,
            history: history
        };

        fetch('/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(payload)
        })
            .then(function (res) {
                if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'request failed'); });
                return res.json();
            })
            .then(function (data) {
                hideTyping();
                const reply = data.reply || '...';
                history.push({ role: 'user', text: text });
                history.push({ role: 'model', text: reply });
                addMessage(reply, 'bot');
            })
            .catch(function (err) {
                hideTyping();
                addMessage(err.message || 'حدث خطأ، حاول مجدداً', 'bot');
                console.error('Nour chat error:', err);
            });
    });
}

document.addEventListener('DOMContentLoaded', initChatPage);