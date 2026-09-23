"""Seed realistic development solutions for existing LifeFix problems.

This script populates 4 practical, sequential solution steps per Problem
for all 18 existing sample problems (72 solutions total) across both English
and Arabic, including cross-lingual equivalent pairs.

It is idempotent: running it multiple times will not create duplicate solutions.
"""

import sys
import uuid
from pathlib import Path

# Configure UTF-8 encoding for console output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure backend directory is in Python path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.database import SessionLocal
from app.models.problem import Problem
from app.models.solution import Solution

# 4 practical solution steps for each of the 18 problems
SAMPLE_SOLUTIONS = {
    # 1. Equivalent Pair 1 (Technology: Slow Laptop - EN)
    "Laptop becomes very slow when multiple applications are open": [
        {
            "step_number": 1,
            "title": "Inspect Resource Usage in Task Manager",
            "solution_text": "Open Task Manager (Ctrl + Shift + Esc) and sort running processes by Memory and CPU usage to identify resource-heavy applications.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 2,
            "title": "Close Inactive Background Apps and Browser Tabs",
            "solution_text": "Exit memory-heavy software you are not actively using and close unnecessary browser tabs or bookmark them for later review.",
            "difficulty": "easy",
            "estimated_time_minutes": 3,
        },
        {
            "step_number": 3,
            "title": "Disable High-Impact Startup Programs",
            "solution_text": "Navigate to the Startup Apps tab in Task Manager or Windows Settings and disable non-essential applications that launch automatically.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "Clear Temporary Cache Files and Reboot",
            "solution_text": "Run Disk Cleanup to remove temporary cache files, then perform a full system restart to refresh RAM and operating system buffers.",
            "difficulty": "medium",
            "estimated_time_minutes": 5,
        },
    ],
    # 2. Equivalent Pair 1 (Technology: Slow Laptop - AR)
    "اللابتوب يصبح بطيئاً جداً عند فتح برامج وتطبيقات متعددة": [
        {
            "step_number": 1,
            "title": "فحص استهلاك الذاكرة والمعالج عبر إدارة المهام",
            "solution_text": "افتح مدير المهام (Task Manager) بالضغط على Ctrl + Shift + Esc ورتب العمليات حسب استهلاك الذاكرة والمعالج لمعرفة البرامج الأكثر استهلاكاً للموارد.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 2,
            "title": "إغلاق التطبيقات وعلامات التبويب غير الضرورية",
            "solution_text": "أغلق البرامج الثقيلة التي لا تستخدمها حالياً وتخلص من علامات التبويب الزائدة في المتصفح أو احفظها كإشارات مرجعية للرجوع إليها لاحقاً.",
            "difficulty": "easy",
            "estimated_time_minutes": 3,
        },
        {
            "step_number": 3,
            "title": "تعطيل برامج بدء التشغيل التلقائي",
            "solution_text": "توجه إلى تبويب تطبيقات بدء التشغيل (Startup Apps) في إعدادات النظام وعطل البرامج غير الأساسية التي تعمل تلقائياً عند إقلاع الجهاز.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "تنظيف الملفات المؤقتة وإعادة تشغيل الجهاز",
            "solution_text": "استخدم أداة تنظيف القرص (Disk Cleanup) لمسح الملفات المؤقتة، ثم أعد تشغيل الحاسوب لتفريغ الذاكرة المؤقتة وتنشيط أداء النظام.",
            "difficulty": "medium",
            "estimated_time_minutes": 5,
        },
    ],
    # 3. Equivalent Pair 2 (Technology: Weak Wi-Fi - EN)
    "Weak Wi-Fi signal in rooms far from the router": [
        {
            "step_number": 1,
            "title": "Reposition the Wireless Router Centrally",
            "solution_text": "Place the router in an elevated, open central location away from thick concrete walls, large metal appliances, and closed cabinets.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "Switch to the 2.4 GHz Band for Better Range",
            "solution_text": "Connect distant devices to the 2.4 GHz Wi-Fi frequency band rather than 5 GHz, as 2.4 GHz penetrates walls and obstacles much better.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "Adjust Router Antennas and Channel Settings",
            "solution_text": "Position router antennas perpendicularly (one vertical, one horizontal) and select a less congested wireless channel in router settings.",
            "difficulty": "medium",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 4,
            "title": "Deploy a Wi-Fi Range Extender or Mesh Node",
            "solution_text": "Place a Wi-Fi repeater or mesh satellite node halfway between the main router and the distant rooms to relay the signal reliably.",
            "difficulty": "medium",
            "estimated_time_minutes": 15,
        },
    ],
    # 4. Equivalent Pair 2 (Technology: Weak Wi-Fi - AR)
    "ضعف إشارة الواي فاي في الغرف البعيدة عن جهاز الراوتر": [
        {
            "step_number": 1,
            "title": "نقل جهاز الراوتر إلى موقع مركزي ومفتوح",
            "solution_text": "ضع الراوتر في مكان مرتفع ومفتوح في وسط المنزل بعيداً عن الجدران الخرسانية السميكة والأجهزة المعدنية الكبيرة والخزائن المغلقة.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "التحويل إلى تردد 2.4 جيجاهرتز لتغطية أوسع",
            "solution_text": "اربط الأجهزة الموجودة في الغرف البعيدة بنطاق التردد 2.4 GHz بدلاً من 5 GHz، حيث يتميز بقدرة أفضل على اختراق الحواجز والجدران.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "تعديل هوائيات الراوتر واختيار قناة أقل ازدحاماً",
            "solution_text": "اضبط هوائيات الراوتر بشكل متعامد (أحدهما عمودي والآخر أفقي) واختر قناة لاسلكية غير مزدحمة من صفحة إعدادات الراوتر.",
            "difficulty": "medium",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 4,
            "title": "استخدام مقوي إشارة (Wi-Fi Extender) أو شبكة Mesh",
            "solution_text": "ثبت مكرر إشارة لاسلكي في منتصف المسافة بين الراوتر الرئيسي والغرف البعيدة لتقوية التغطية ونقل الإشارة بكفاءة واستقرار.",
            "difficulty": "medium",
            "estimated_time_minutes": 15,
        },
    ],
    # 5. Equivalent Pair 3 (Study & Productivity: Focus & Distractions - EN)
    "Difficulty maintaining focus and avoiding phone distractions while studying": [
        {
            "step_number": 1,
            "title": "Keep the Phone Out of Arm's Reach",
            "solution_text": "Place your phone in another room or inside a closed drawer before beginning study sessions to create physical friction against reflex checking.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 2,
            "title": "Enable Do Not Disturb or Focus Mode",
            "solution_text": "Activate Focus mode to silence all non-emergency app notifications, calls, and message alerts during planned study blocks.",
            "difficulty": "easy",
            "estimated_time_minutes": 3,
        },
        {
            "step_number": 3,
            "title": "Study in Timed Intervals (Pomodoro Technique)",
            "solution_text": "Use a timer to study with full concentration for 25 minutes, followed by a disciplined 5-minute break without opening social media.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "Prepare a Clear Written Micro-Goal",
            "solution_text": "Write down the exact 2 or 3 pages or problems you will complete during the session before sitting down to maintain direct momentum.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 6. Equivalent Pair 3 (Study & Productivity: Focus & Distractions - AR)
    "صعوبة الحفاظ على التركيز وتجنب مشتتات الهاتف أثناء المذاكرة": [
        {
            "step_number": 1,
            "title": "إبعاد الهاتف عن متناول اليد والأنظار",
            "solution_text": "ضع الهاتف في غرفة أخرى أو داخل درج مغلق قبل بدء جلسة المذاكرة لخلق حاجز جسدي يقلل من رغبة تفقده العفوية.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 2,
            "title": "تفعيل نمط التركيز (Focus Mode) وعدم الإزعاج",
            "solution_text": "فعل وضع التركيز أو حظر الإشعارات على الهاتف لإيقاف تنبيهات تطبيقات التواصل الاجتماعي والرسائل طوال فترة الدراسة.",
            "difficulty": "easy",
            "estimated_time_minutes": 3,
        },
        {
            "step_number": 3,
            "title": "الدراسة وفق فترات زمنية محددة (تقنية بومودورو)",
            "solution_text": "اعتمد فترات تركيز مدتها 25 دقيقة من العمل المستمر تليها استراحة قصيرة لمدة 5 دقائق لإراحة الذهن دون فتح مواقع التشتيت.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "تحديد هدف دراسي محدد ومكتوب قبل البدء",
            "solution_text": "اكتب على ورقة صغيرة الصفحات أو التمارين التي ستنجزها خلال الجلسة بدقة لتبقى وجهتك واضحة وتقلل من التردد والتسويف.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 7. Equivalent Pair 4 (Personal Organization: Daily Tasks - EN)
    "Difficulty organizing daily tasks and managing daily schedule": [
        {
            "step_number": 1,
            "title": "Perform a Brain Dump of All Pending Tasks",
            "solution_text": "Write down every uncompleted task and obligation currently on your mind onto a single sheet of paper without premature filtering.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 2,
            "title": "Select the Top 3 Non-Negotiable Priorities",
            "solution_text": "Identify the 3 most impactful tasks that must be finished today, and commit to completing them before addressing minor errands.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "Time-Block the Day into Realistic Windows",
            "solution_text": "Assign dedicated time slots on your calendar for deep focused work, buffer time, and routine communication rather than working reactively.",
            "difficulty": "medium",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 4,
            "title": "Review and Reset the Task List Every Evening",
            "solution_text": "Spend 5 minutes before bed reviewing completed items, rolling over unfinished tasks, and setting the primary focus for tomorrow.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 8. Equivalent Pair 4 (Personal Organization: Daily Tasks - AR)
    "صعوبة تنظيم المهام اليومية وإدارة جدول الوقت": [
        {
            "step_number": 1,
            "title": "تفريغ جميع الأفكار والمهام على ورقة عمل",
            "solution_text": "دون كافة المهام والالتزامات المعلقة في ذهنك على ورقة واحدة بشكل تلقائي للتخلص من التشتت الذهني والشعور بالتراكم.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 2,
            "title": "اختيار أهم 3 أولويات رئيسية لليوم",
            "solution_text": "حدد المهام الثلاث الأكثر أهمية وإلحاحاً لإنجازها أولاً خلال اليوم، وركز طاقتك عليها قبل الانتقال إلى المهام الجانبية.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "تقسيم اليوم إلى كتل زمنية محددة (Time Blocking)",
            "solution_text": "خصص فترات زمنية واضحة في جدولك لإنجاز المهام الكبرى، مع وضع فواصل زمنية مرنة للتعامل مع أي طارئ دون إرباك اليوم.",
            "difficulty": "medium",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 4,
            "title": "مراجعة ختامية سريعة في نهاية كل يوم",
            "solution_text": "خصص خمس دقائق كل مساء لمراجعة ما تم إنجازه، وترحيل المهام المتبقية، وتحديد أولويات صباح اليوم التالي.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 9. Additional English: Smartphone Storage
    "Smartphone storage is almost full despite deleting large videos": [
        {
            "step_number": 1,
            "title": "Clear Messaging App Cache and Media Downloads",
            "solution_text": "Open messaging apps like WhatsApp or Telegram and clear accumulated media caches, voice notes, and duplicate video downloads in storage settings.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "Review and Offload Unused Applications",
            "solution_text": "Check device storage settings and uninstall or offload heavy applications and games that have not been launched in over a month.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "Backup Media to Cloud and Free Local Space",
            "solution_text": "Sync your photo gallery to a reliable cloud service and use the built-in 'Free up device storage' feature to remove local copies.",
            "difficulty": "easy",
            "estimated_time_minutes": 15,
        },
        {
            "step_number": 4,
            "title": "Delete Browser Cache and System Download Folders",
            "solution_text": "Clear mobile browser cached web data and inspect your phone Downloads directory to remove old PDF files and installation packages.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 10. Additional English: Clothes Drying Indoors
    "Clothes take too long to dry indoors during cold or humid weather": [
        {
            "step_number": 1,
            "title": "Run an Extra Spin Cycle in the Washing Machine",
            "solution_text": "After washing finishes, run an additional high-speed spin-only cycle to remove excess moisture from fabrics before hanging.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "Space Clothes Evenly on the Drying Rack",
            "solution_text": "Avoid overlapping garments; leave at least 2 inches between hanging items and use clothes hangers to maximize airflow around fabric.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "Position Rack Near Ventilation or a Room Fan",
            "solution_text": "Place the drying rack near an oscillating fan or an open window to keep air circulating continuously across the damp fabric.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "Use a Dehumidifier in the Drying Room",
            "solution_text": "Close doors to the drying room and run a portable dehumidifier to actively remove moisture from indoor air and speed up evaporation.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 11. Additional English: Travel Packing
    "Frequently forgetting essential travel items before departure": [
        {
            "step_number": 1,
            "title": "Create a Reusable Digital Travel Packing Checklist",
            "solution_text": "Build a master checklist categorized into electronics, toiletries, essential travel documents, and clothing in your phone notes app.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "Pack Non-Daily Essentials 24 Hours in Advance",
            "solution_text": "Pack clothes, travel adapters, and backup items the day before travel so you are not rushed or fatigued on departure morning.",
            "difficulty": "easy",
            "estimated_time_minutes": 20,
        },
        {
            "step_number": 3,
            "title": "Assemble a Dedicated 'Essentials Pouch'",
            "solution_text": "Keep your passport, wallet, primary phone chargers, and keys in one dedicated, zippered pouch that moves straight into your personal carry-on.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "Conduct a Final 2-Minute Doorstep Scan",
            "solution_text": "Before locking the front door, pause and physically verify the critical four essentials: phone, wallet, keys, and tickets or passports.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
    ],
    # 12. Additional English: Cash Expenses
    "Struggling to track small daily cash expenses and stay within budget": [
        {
            "step_number": 1,
            "title": "Record Every Micro-Expense Immediately on Your Phone",
            "solution_text": "Use a simple note or budgeting app widget to record cash spent on coffee, snacks, or transit right at the moment of payment.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 2,
            "title": "Adopt a Fixed Weekly Cash Allowance",
            "solution_text": "Withdraw a fixed amount of cash every Monday for casual daily spending and stop non-essential purchases once that cash is depleted.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "Review Daily Spending Total Each Evening",
            "solution_text": "Take 1 minute each night to check the day's total cash outlay and notice recurring patterns of unplanned impulse spending.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 4,
            "title": "Identify and Cap the Top Discretionary Expense Category",
            "solution_text": "Review past receipts to identify frequent small leaks (such as daily takeout drinks) and set a realistic monthly ceiling.",
            "difficulty": "medium",
            "estimated_time_minutes": 10,
        },
    ],
    # 13. Additional English: Food Freshness
    "Fresh vegetables spoil too quickly in the refrigerator before being cooked": [
        {
            "step_number": 1,
            "title": "Remove Trapped Moisture and Condensation Promptly",
            "solution_text": "Take greens out of plastic supermarket bags and wrap them loosely in dry paper towels to absorb excess condensation.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 2,
            "title": "Store in Ventilated Produce Containers",
            "solution_text": "Use dedicated crisper drawers with moderate humidity settings and keep leafy greens separate from ethylene-producing fruits like apples.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 3,
            "title": "Wash Vegetables Only Immediately Before Cooking",
            "solution_text": "Do not wash produce prior to storage, as residual moisture rapidly accelerates mold growth and leaf breakdown.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 4,
            "title": "Plan Meals and Cook High-Perishables First",
            "solution_text": "Schedule delicate greens (spinach, herbs) for the first two days after grocery shopping, saving hardy root vegetables for later in the week.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 14. Additional Arabic: Dust on Furniture
    "تراكم الغبار بسرعة على الأثاث والأسطح داخل المنزل": [
        {
            "step_number": 1,
            "title": "استخدام أقمشة ألياف دقيقة (مايكروفايبر) مبللة قليلاً",
            "solution_text": "امسح الغبار بقطعة قماش مايكروفايبر مبللة برذاذ ماء خفيف بدلاً من منافض الريش التي تنثر الغبار في الهواء ليعود للاستقرار مجدداً.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "تنظيف الأسطح من الأعلى إلى الأسفل",
            "solution_text": "ابدأ بمسح الرفوف والمصابيح العلوية أولاً ثم انتقل إلى الطاولات والأرضيات أخيراً لتجنب تساقط الأتربة على الأسطح المنظفة.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 3,
            "title": "فحص فلاتر الهواء والستائر بانتظام",
            "solution_text": "اغسل فلاتر أجهزة التكييف والتهوية شهرياً وانفض الستائر وأغطية الأرائك دورياً لتقليل مصدر الألياف المتطايرة في الغرفة.",
            "difficulty": "medium",
            "estimated_time_minutes": 15,
        },
        {
            "step_number": 4,
            "title": "إحكام إغلاق النوافذ خلال أوقات الرياح القوية",
            "solution_text": "أغلق النوافذ المطلة على الشارع خلال فترات حركة الرياح أو الغبار، واستخدم أشرطة عزل بسيطة على أطراف الأبواب والنوافذ.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 15. Additional Arabic: Luggage Packing
    "صعوبة ترتيب وتنظيم الملابس داخل حقيبة السفر لتوفير المساحة": [
        {
            "step_number": 1,
            "title": "لف الملابس بإحكام بدلاً من طيها التقليدي",
            "solution_text": "لف القمصان والبنطلونات والملابس القطنية بشكل أسطواني محكم لتوفير المساحة داخل الحقيبة ومنع تشكل التجاعيد والكسرات.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 2,
            "title": "استخدام أكياس تنظيم الأمتعة (Packing Cubes)",
            "solution_text": "قسم الملابس إلى فئات داخل منظمات قماشية خفيفة لضغط الحجم وسهولة العثور على أي قطعة دون بعثرة كامل الحقيبة.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 3,
            "title": "استغلال الفراغات الداخلية مثل الأحذية",
            "solution_text": "ضع الجوارب والشواحن الصغيرة داخل الأحذية بعد وضعها في أكياس حماية للاستفادة من كل زاوية ميتة في الحقيبة.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "وضع الأغراض الثقيلة في قاع الحقيبة قرب العجلات",
            "solution_text": "رتب الأحذية والمعاطف الثقيلة في الأسفل جهة عجلات الحقيبة لتسهيل سحبها وتحقيق توازن محكم للأمتعة أثناء التنقل.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
    # 16. Additional Arabic: Emergency Savings
    "صعوبة الالتزام بخطة ادخار شهرية ثابتة لحالات الطوارئ": [
        {
            "step_number": 1,
            "title": "تطبيق مبدأ الادخار التلقائي في يوم نزول الراتب",
            "solution_text": "حدد تحويلاً آلياً لمبلغ بسيط (مثلاً 5% إلى 10% من الدخل) إلى حساب ادخاري منفصل في نفس يوم استلام الراتب قبل بدء الصرف.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 2,
            "title": "فصل حساب الطوارئ عن بطاقة الصرف اليومي",
            "solution_text": "احتفظ بحساب الادخار في بنك أو حساب فرعي دون ربطه ببطاقة شراء يومية لتقليل دافع السحب منه للمشتريات العابرة.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 3,
            "title": "البدء بهدف ادخاري صغير وتدريجي",
            "solution_text": "ضع هدفاً أولياً بسيطاً لتغطية نفقات طارئة لمدة أسبوعين، والاحتفال بالوصول إليه قبل محاولة بناء صندوق لعدة أشهر.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 4,
            "title": "مراجعة الاشتراكات والخدمات الشهرية غير المستغلة",
            "solution_text": "ألغِ الاشتراكات الرقمية أو الخدمات التي لا تستخدمها دورياً ووجه قيمتها الشهرية مباشرة إلى وعاء ادخار الطوارئ.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
    ],
    # 17. Additional Arabic: Food Waste
    "التخلص من بقايا الطعام الزائدة دون هدر أو تلف": [
        {
            "step_number": 1,
            "title": "تبريد بقايا الطعام في أوعية محكمة الإغلاق خلال ساعتين",
            "solution_text": "احفظ الأطعمة المطبوخة في علب زجاجية أو بلاستيكية محكمة الإغلاق وضعها في الثلاجة في غضون ساعتين من انتهاء الوجبة.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
        {
            "step_number": 2,
            "title": "كتابة تاريخ التخزين على العلب",
            "solution_text": "ضع ملصقاً صغيراً بتاريخ الطهي واستهلك الوجبات المحفوظة خلال يومين إلى ثلاثة أيام كحد أقصى لضمان سلامتها وجودة مذاقها.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 3,
            "title": "تجميد الوجبات المناسبة للحرارة في الفريزر",
            "solution_text": "قسم اليخنات والشوربات والصلصات إلى حصص فردية وجمدها في الفريزر لاستخدامها كوجبات سريعة في أيام العمل المزدحمة.",
            "difficulty": "easy",
            "estimated_time_minutes": 10,
        },
        {
            "step_number": 4,
            "title": "إعادة تدوير المكونات في وجبة جديدة ومبتكرة",
            "solution_text": "استخدم بقايا الدجاج أو الخضار المشوية لتحضير شطائر سريعة، أو حشوة فطائر، أو سلطة طازجة بدلاً من تكرار نفس الطبق.",
            "difficulty": "easy",
            "estimated_time_minutes": 15,
        },
    ],
    # 18. Additional Arabic: Screen Fatigue
    "الشعور بالإرهاق والخمول خلال فترات العمل الطويلة أمام الشاشة": [
        {
            "step_number": 1,
            "title": "تطبيق قاعدة 20-20-20 لإراحة العينين",
            "solution_text": "انظر كل 20 دقيقة إلى جسم يبعد حوالي 20 قدماً (6 أمتار) لمدة 20 ثانية لإرخاء عضلات العينين وتقليل الصداع والإجهاد البصري.",
            "difficulty": "easy",
            "estimated_time_minutes": 1,
        },
        {
            "step_number": 2,
            "title": "النهوض والمشي الخفيف لمدة دقيقتين كل ساعة",
            "solution_text": "قف وتحرك لتنشيط الدورة الدموية في الساقين وتمديد عضلات الظهر والرقبة لتجديد النشاط البدني والذهني.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 3,
            "title": "شرب كوب ماء بانتظام وضبط إضاءة الشاشة",
            "solution_text": "احتفظ بزجاجة ماء على المكتب وتناول رشفات متكررة، واضبط سطوع الشاشة ليتوافق مع مستوى إضاءة الغرفة المحيطة.",
            "difficulty": "easy",
            "estimated_time_minutes": 2,
        },
        {
            "step_number": 4,
            "title": "ضبط الوضعية المريحة للكرسي والشاشة",
            "solution_text": "اجعل الحافة العلوية للشاشة بمستوى العينين مع إسناد الظهر جيداً ووضع القدمين بشكل مسطح على الأرض لتقليل الشد العضلي.",
            "difficulty": "easy",
            "estimated_time_minutes": 5,
        },
    ],
}


def seed_sample_solutions() -> dict:
    """Seed sample solution steps for the existing 18 LifeFix problems in PostgreSQL."""
    db = SessionLocal()
    stats = {
        "solutions_created": 0,
        "solutions_skipped": 0,
        "problems_matched": 0,
        "problems_missing": 0,
    }

    try:
        print("=== Step 6.10: Seeding Sample Solutions ===")

        # 1. Fetch existing problems from database
        existing_problems = db.scalars(select(Problem)).all()
        problem_by_title = {p.title: p for p in existing_problems}
        print(f"Loaded {len(problem_by_title)} existing problems from database.")

        # 2. Iterate through sample solutions and insert idempotently
        for problem_title, solution_steps in SAMPLE_SOLUTIONS.items():
            problem = problem_by_title.get(problem_title)
            if not problem:
                print(f"WARNING: Problem not found in database: \"{problem_title}\"")
                stats["problems_missing"] += 1
                continue

            stats["problems_matched"] += 1

            for step in solution_steps:
                # Check for existing solution by (problem_id, step_number)
                existing_sol = db.scalars(
                    select(Solution).where(
                        Solution.problem_id == problem.id,
                        Solution.step_number == step["step_number"],
                    )
                ).first()

                if existing_sol:
                    stats["solutions_skipped"] += 1
                else:
                    new_sol = Solution(
                        id=uuid.uuid4(),
                        problem_id=problem.id,
                        title=step["title"],
                        solution_text=step["solution_text"],
                        step_number=step["step_number"],
                        difficulty=step.get("difficulty"),
                        estimated_time_minutes=step.get("estimated_time_minutes"),
                    )
                    db.add(new_sol)
                    stats["solutions_created"] += 1

        db.commit()

        print(
            f"Seeding completed: {stats['solutions_created']} solutions created, "
            f"{stats['solutions_skipped']} solutions already existed, "
            f"{stats['problems_matched']}/{len(SAMPLE_SOLUTIONS)} problems matched."
        )
        return stats

    except Exception as exc:
        db.rollback()
        print(f"Error during solution seeding: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_solutions()
