"""Seed sample everyday LifeFix problems with multilingual pgvector embeddings.

This script populates a development dataset of 18 realistic everyday problems
spanning Technology, Study & Productivity, Home & Living, Travel, Personal Finance,
Food & Cooking, and Personal Organization in both English and Arabic.

It is idempotent: running it multiple times will not create duplicate categories
or problems.
"""

import math
import sys
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
from app.models.category import Category
from app.models.problem import Problem
from app.services.embedding_service import EmbeddingService

# Categories to ensure exist
SAMPLE_CATEGORIES = [
    {
        "name": "Technology",
        "description": "Computers, smartphones, internet connection, and software troubleshooting.",
        "icon": "laptop",
    },
    {
        "name": "Study & Productivity",
        "description": "Concentration, study techniques, productivity habits, and digital distractions.",
        "icon": "book-open",
    },
    {
        "name": "Home & Living",
        "description": "Household maintenance, domestic chores, cleaning, and living environment.",
        "icon": "home",
    },
    {
        "name": "Travel",
        "description": "Travel logistics, luggage packing, trip planning, and journey preparation.",
        "icon": "plane",
    },
    {
        "name": "Personal Finance",
        "description": "Everyday expense management, budgeting, and simple money-saving habits.",
        "icon": "wallet",
    },
    {
        "name": "Food & Cooking",
        "description": "Kitchen efficiency, meal preparation, ingredient freshness, and food storage.",
        "icon": "utensils",
    },
    {
        "name": "Personal Organization",
        "description": "Task management, daily schedules, routines, and physical decluttering.",
        "icon": "check-square",
    },
]

# 18 realistic everyday problems (balanced EN/AR with equivalent pairs, non-healthcare)
SAMPLE_PROBLEMS = [
    # --- Equivalent Pair 1 (Technology: Slow Laptop) ---
    {
        "category": "Technology",
        "title": "Laptop becomes very slow when multiple applications are open",
        "description": "The laptop freezes and runs extremely slowly whenever multiple browser tabs and background applications are open at the same time.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    {
        "category": "Technology",
        "title": "اللابتوب يصبح بطيئاً جداً عند فتح برامج وتطبيقات متعددة",
        "description": "يتجمد جهاز الحاسوب المحمول ويعمل ببطء شديد كلما فتحت عدة صفحات في المتصفح وتطبيقات في الخلفية في نفس الوقت.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    # --- Equivalent Pair 2 (Technology: Weak Wi-Fi) ---
    {
        "category": "Technology",
        "title": "Weak Wi-Fi signal in rooms far from the router",
        "description": "The internet connection drops frequently and becomes very slow in distant rooms away from the wireless router.",
        "difficulty": "medium",
        "estimated_time_minutes": 20,
        "is_verified": True,
    },
    {
        "category": "Technology",
        "title": "ضعف إشارة الواي فاي في الغرف البعيدة عن جهاز الراوتر",
        "description": "ينقطع اتصال الإنترنت بشكل متكرر ويصبح بطيئاً جداً في الغرف البعيدة عن راوتر الشبكة اللاسلكية.",
        "difficulty": "medium",
        "estimated_time_minutes": 20,
        "is_verified": True,
    },
    # --- Equivalent Pair 3 (Study & Productivity: Focus & Procrastination) ---
    {
        "category": "Study & Productivity",
        "title": "Difficulty maintaining focus and avoiding phone distractions while studying",
        "description": "Constant urge to check smartphone notifications and social media feeds causes continuous procrastination during study sessions.",
        "difficulty": "medium",
        "estimated_time_minutes": 25,
        "is_verified": True,
    },
    {
        "category": "Study & Productivity",
        "title": "صعوبة الحفاظ على التركيز وتجنب مشتتات الهاتف أثناء المذاكرة",
        "description": "الرغبة المستمرة في تفقد إشعارات الهاتف الذكي وتطبيقات التواصل الاجتماعي تؤدي إلى المماطلة وتشتت الانتباه أثناء جلسات الدراسة.",
        "difficulty": "medium",
        "estimated_time_minutes": 25,
        "is_verified": True,
    },
    # --- Equivalent Pair 4 (Personal Organization: Daily Task Overwhelm) ---
    {
        "category": "Personal Organization",
        "title": "Difficulty organizing daily tasks and managing daily schedule",
        "description": "Feeling overwhelmed by cluttered daily to-do lists, leading to missed deadlines and poor prioritization of urgent tasks.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    {
        "category": "Personal Organization",
        "title": "صعوبة تنظيم المهام اليومية وإدارة جدول الوقت",
        "description": "الشعور بالارتباك أمام قوائم المهام اليومية المتراكمة، مما يؤدي إلى تفويت المواعيد وسوء ترتيب الأولويات العاجلة.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    # --- Additional English Problems ---
    {
        "category": "Technology",
        "title": "Smartphone storage is almost full despite deleting large videos",
        "description": "Phone constantly displays low storage alerts because hidden cache, messaging media backups, and system data consume available space.",
        "difficulty": "medium",
        "estimated_time_minutes": 20,
        "is_verified": True,
    },
    {
        "category": "Home & Living",
        "title": "Clothes take too long to dry indoors during cold or humid weather",
        "description": "Washed laundry hung inside the apartment remains damp for over 24 hours, resulting in unpleasant musty odors.",
        "difficulty": "easy",
        "estimated_time_minutes": 10,
        "is_verified": True,
    },
    {
        "category": "Travel",
        "title": "Frequently forgetting essential travel items before departure",
        "description": "Rushing to pack right before leaving for the airport leads to missing phone chargers, adapters, or essential travel documents.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    {
        "category": "Personal Finance",
        "title": "Struggling to track small daily cash expenses and stay within budget",
        "description": "Unrecorded daily micro-expenses like coffee and impulse snacks cause monthly budget deficits without knowing where money went.",
        "difficulty": "easy",
        "estimated_time_minutes": 10,
        "is_verified": True,
    },
    {
        "category": "Food & Cooking",
        "title": "Fresh vegetables spoil too quickly in the refrigerator before being cooked",
        "description": "Leafy greens and vegetables spoil and turn slimy within three days of buying, resulting in repeated grocery waste.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    # --- Additional Arabic Problems ---
    {
        "category": "Home & Living",
        "title": "تراكم الغبار بسرعة على الأثاث والأسطح داخل المنزل",
        "description": "يعود الغبار للتراكم على الطاولات والرفوف بعد ساعات قليلة فقط من تنظيفها ومسحها بسبب سوء التهوية أو الأقمشة.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    {
        "category": "Travel",
        "title": "صعوبة ترتيب وتنظيم الملابس داخل حقيبة السفر لتوفير المساحة",
        "description": "امتلاء حقيبة السفر بسرعة وصعوبة إغلاقها مع تجعد الملابس أثناء التنقل بسبب عدم اتباع طريقة طي أو حزم مناسبة.",
        "difficulty": "easy",
        "estimated_time_minutes": 20,
        "is_verified": True,
    },
    {
        "category": "Personal Finance",
        "title": "صعوبة الالتزام بخطة ادخار شهرية ثابتة لحالات الطوارئ",
        "description": "نفاد الراتب الشهري قبل نهاية الشهر دون القدرة على اقتطاع مبلغ مالي ثابت ومخصص لصندوق الطوارئ العائلي.",
        "difficulty": "medium",
        "estimated_time_minutes": 30,
        "is_verified": True,
    },
    {
        "category": "Food & Cooking",
        "title": "التخلص من بقايا الطعام الزائدة دون هدر أو تلف",
        "description": "طهي كميات طعام أكبر من حاجة العائلة والتردد في كيفية تخزينها أو إعادة ابتكار وجبات جديدة منها بأمان.",
        "difficulty": "easy",
        "estimated_time_minutes": 15,
        "is_verified": True,
    },
    {
        "category": "Study & Productivity",
        "title": "الشعور بالإرهاق والخمول خلال فترات العمل الطويلة أمام الشاشة",
        "description": "إجهاد العينين وانخفاض مستويات الطاقة الذهنية بعد الجلوس المستمر للعمل أمام شاشة الكمبيوتر لأكثر من أربع ساعات متواصلة.",
        "difficulty": "easy",
        "estimated_time_minutes": 10,
        "is_verified": True,
    },
]


def validate_embedding(embedding: list[float], context_name: str) -> None:
    """Validate vector properties: length 384, finite numeric values, and unit L2 norm."""
    if not isinstance(embedding, list):
        raise ValueError(f"[{context_name}] Embedding must be a list, got {type(embedding).__name__}")
    if len(embedding) != 384:
        raise ValueError(f"[{context_name}] Embedding dimension mismatch: expected 384, got {len(embedding)}")
    if not all(isinstance(v, float) and not math.isnan(v) and not math.isinf(v) for v in embedding):
        raise ValueError(f"[{context_name}] Embedding contains invalid or non-float values (NaN/Inf)")
    norm = math.sqrt(sum(v * v for v in embedding))
    if abs(norm - 1.0) > 1e-3:
        raise ValueError(f"[{context_name}] Embedding is not properly normalized (L2 norm: {norm:.6f})")


def seed_sample_problems() -> dict:
    """Seed sample categories and problems with E5 passage embeddings into PostgreSQL."""
    db = SessionLocal()
    embedding_service = EmbeddingService()

    stats = {
        "categories_existing": 0,
        "categories_created": 0,
        "problems_existing": 0,
        "problems_created": 0,
        "embeddings_generated": 0,
    }

    try:
        print("=== Step 6.7: Seeding Sample Problems & Embeddings ===")

        # 1. Ensure categories exist
        category_map = {}
        for cat_data in SAMPLE_CATEGORIES:
            existing_cat = db.scalars(
                select(Category).where(Category.name == cat_data["name"])
            ).first()

            if existing_cat:
                category_map[cat_data["name"]] = existing_cat
                stats["categories_existing"] += 1
            else:
                new_cat = Category(
                    name=cat_data["name"],
                    description=cat_data["description"],
                    icon=cat_data["icon"],
                )
                db.add(new_cat)
                db.flush()
                category_map[cat_data["name"]] = new_cat
                stats["categories_created"] += 1

        print(
            f"Categories: {stats['categories_created']} created, "
            f"{stats['categories_existing']} already existed."
        )

        # 2. Ensure sample problems exist with embeddings
        for prob_data in SAMPLE_PROBLEMS:
            cat_name = prob_data["category"]
            category = category_map[cat_name]

            existing_prob = db.scalars(
                select(Problem).where(Problem.title == prob_data["title"])
            ).first()

            if existing_prob:
                stats["problems_existing"] += 1
                # If problem exists but embedding is missing, populate it
                if existing_prob.embedding is None:
                    passage_text = f"{existing_prob.title}\n{existing_prob.description}"
                    emb = embedding_service.embed_passage(passage_text)
                    validate_embedding(emb, existing_prob.title)
                    existing_prob.embedding = emb
                    stats["embeddings_generated"] += 1
                continue

            # Generate embedding as a passage (E5 convention: passage: <title>\n<description>)
            passage_text = f"{prob_data['title']}\n{prob_data['description']}"
            embedding = embedding_service.embed_passage(passage_text)
            validate_embedding(embedding, prob_data["title"])
            stats["embeddings_generated"] += 1

            new_prob = Problem(
                title=prob_data["title"],
                description=prob_data["description"],
                category_id=category.id,
                difficulty=prob_data.get("difficulty", "medium"),
                estimated_time_minutes=prob_data.get("estimated_time_minutes"),
                is_verified=prob_data.get("is_verified", True),
                embedding=embedding,
                created_by=None,
            )
            db.add(new_prob)
            stats["problems_created"] += 1

        db.commit()

        print(
            f"Problems: {stats['problems_created']} created, "
            f"{stats['problems_existing']} already existed, "
            f"{stats['embeddings_generated']} embeddings generated."
        )
        return stats

    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_problems()
