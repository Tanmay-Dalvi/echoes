from typing import List
from .models import Memory, RemembranceCard

FICTIONAL_DEMO_MEMORIES: List[dict] = [
    {
        "id": "demo-mem-01",
        "title": "Abuela Elena's Sunday Pan Dulce & Anise Tea",
        "story": "Every Sunday morning before the bells of Saint Jude chimed, Abuela Elena would already have the flour dusted across her small wooden kitchen table in East Los Angeles. She never wrote down the measurements for her conchas or the anise seed brew—she claimed her palms could feel when the dough was ready. She would hand my cousin Carlos and me small balls of sweet dough to shape into miniature animals while telling us about the citrus groves in Michoacán where her father worked. The kitchen smelled of ground cinnamon, melted piloncillo, and warm yeast. Whenever the radio played Agustín Lara, she would pause, wipe her hands on her embroidered apron, and sway gently.",
        "date": "1975-10-12",
        "approximate_period": "Autumn 1975",
        "category": "Tradition",
        "people": ["Abuela Elena", "Carlos"],
        "places": ["East Los Angeles", "Michoacán", "Saint Jude Church"],
        "tags": ["baking", "pan dulce", "sunday mornings", "childhood", "family recipes"],
        "ai_remembrance_card": {
            "title": "The Baker's Intuition",
            "essence": "Sunday mornings measured not in ounces or minutes, but by the dusting of flour and the fragrance of warm cinnamon and anise.",
            "key_elements": ["East Los Angeles kitchen", "Conchas shaped like animals", "Stories of Michoacán citrus groves", "Agustín Lara on the radio"],
            "quote_or_moment": "She claimed her palms could feel when the dough was ready.",
            "generated_at": "2026-10-28T10:00:00Z",
            "model": "gemma3:1b",
            "is_ai_assisted": True
        },
        "ai_tribute": "In loving memory of Abuela Elena, who taught us that warmth is crafted by hand, that heritage lives in the aroma of canela and anise, and that the greatest family recipes are the ones passed down through patience, laughter, and open arms. (AI-assisted reflection based on fictional demo story)",
        "ai_summary": "A cherished ritual in East Los Angeles where Abuela Elena taught the younger generation traditional baking through touch and ancestral storytelling."
    },
    {
        "id": "demo-mem-02",
        "title": "Arthur's Cedar Skiff in the Harbor",
        "story": "Grandfather Arthur spent three winters building 'The Wanderer', a fourteen-foot cedar plank skiff, inside his drafty barn in Camden, Maine. He worked by the light of a kerosene lamp, smelling of white oak shavings and copper rivets. In the spring of 1968, when the ice broke on the bay, our neighbor Captain Mac helped us roll the hull down to the slipway on greased hemlock logs. Arthur didn't speak much that morning; he just touched the gunwale with his calloused thumb and watched the dark Atlantic water take her weight without a single leak.",
        "date": "1968-04-18",
        "approximate_period": "Spring 1968",
        "category": "Oral History",
        "people": ["Grandfather Arthur", "Captain Mac"],
        "places": ["Camden, Maine", "Penobscot Bay"],
        "tags": ["boatbuilding", "woodworking", "ocean", "craftsmanship", "maine"],
        "ai_remembrance_card": {
            "title": "Cedar on Dark Waters",
            "essence": "Three winters of quiet labor in a kerosene-lit barn, culminating in a boat that met the Atlantic without a whisper of doubt.",
            "key_elements": ["Hand-planed cedar skiff", "Greased hemlock logs", "Quiet pride on the slipway"],
            "quote_or_moment": "He watched the dark Atlantic water take her weight without a single leak.",
            "generated_at": "2026-10-28T10:05:00Z",
            "model": "gemma3:1b",
            "is_ai_assisted": True
        },
        "ai_tribute": "Grandfather Arthur built more than wooden vessels; he gave form to patience, integrity, and quiet dedication. His hands proved that honest work endures the roughest tides. (AI-assisted reflection based on fictional demo story)",
        "ai_summary": "Grandfather Arthur launches 'The Wanderer', a hand-crafted cedar skiff built across three winters in Maine."
    },
    {
        "id": "demo-mem-03",
        "title": "Clara's V-Mail Letters from the Hospital Ward",
        "story": "Tucked inside an old cigar box beneath the wardrobe, we discovered Aunt Clara's wartime letters written from a field hospital tent near Bristol during the final autumn of the war. As a volunteer nurse, she wrote home to her sister Margaret about rationing powdered milk, mending woolen socks for wounded airmen, and how they danced to a scratchy Glenn Miller record when the blackout curtains were drawn. Her handwriting was small and tight to save paper, but her humor was sharp and unyielding.",
        "date": "1944-11-04",
        "approximate_period": "Late 1944",
        "category": "Milestone",
        "people": ["Aunt Clara", "Margaret", "Glenn Miller"],
        "places": ["Bristol, England", "Field Hospital 42"],
        "tags": ["world war ii", "letters", "nursing", "resilience", "family archive"],
        "ai_remembrance_card": {
            "title": "Light Behind the Blackout Curtains",
            "essence": "Small script on fragile V-mail paper bearing witness to courage, swing music, and compassion amidst wartime upheaval.",
            "key_elements": ["Bristol field hospital", "Glenn Miller on gramophone", "Tight handwriting preserving precious paper"],
            "quote_or_moment": "Her handwriting was small and tight to save paper, but her humor was sharp and unyielding.",
            "generated_at": "2026-10-28T10:10:00Z",
            "model": "gemma3:1b",
            "is_ai_assisted": True
        },
        "ai_tribute": "Aunt Clara's letters remind us of the quiet bravery that holds communities together in times of crisis—finding rhythm and hope even in the darkest hours. (AI-assisted reflection based on fictional demo story)",
        "ai_summary": "Wartime letters from nurse Clara in Bristol recording resilience, music, and care during the autumn of 1944."
    },
    {
        "id": "demo-mem-04",
        "title": "Stargazing on the Porch Roof in Taos",
        "story": "During the Perseid meteor shower of August 1982, my father and older brother Marco hauled a stack of wool blankets through the second-story bedroom window onto the flat adobe roof of our house in Taos, New Mexico. The desert night was crisp and smelled of piñon pine and dry earth. Dad brought his battered brass telescope, but we quickly laid flat on our backs, tracking green streaks across the Milky Way. He explained how ancient astronomers in the high plains navigated by the North Star, and how light from distant stars had traveled for centuries just to reach our eyes.",
        "date": "1982-08-12",
        "approximate_period": "Summer 1982",
        "category": "Family",
        "people": ["Father", "Marco"],
        "places": ["Taos, New Mexico", "Sangre de Cristo Mountains"],
        "tags": ["stargazing", "meteor shower", "desert", "astronomy", "brothers"],
        "ai_remembrance_card": {
            "title": "Light from Centuries Past",
            "essence": "Wool blankets on adobe and a desert sky illuminated by falling stars, binding generations under the high desert heavens.",
            "key_elements": ["Adobe roof in Taos", "Perseid meteor shower", "Smell of piñon pine", "Ancient celestial navigation"],
            "quote_or_moment": "Light from distant stars had traveled for centuries just to reach our eyes.",
            "generated_at": "2026-10-28T10:15:00Z",
            "model": "gemma3:1b",
            "is_ai_assisted": True
        },
        "ai_tribute": "A memory of wonder and kinship under the vast New Mexico night, where a father opened the infinite universe to his children with warmth and stories. (AI-assisted reflection based on fictional demo story)",
        "ai_summary": "A peaceful family stargazing night on an adobe roof in Taos during the 1982 Perseids."
    },
    {
        "id": "demo-mem-05",
        "title": "Maya's Solar-Powered Water Filter Science Fair",
        "story": "My sister Maya stayed up for four straight nights in the garage preparing her 8th-grade science fair demonstration. She built a portable ultraviolet water purifier using recycled plastic soda bottles, quartz sand, charcoal from our barbecue pit, and a tiny 6-volt solar panel scavenged from a garden path light. When the judges stopped by her booth in the gymnasium, her hands trembled, but when she poured murky pond water in and clean, clear drops dripped through the beaker, she smiled so widely her braces flashed. She won the blue ribbon for Environmental Innovation.",
        "date": "2005-03-24",
        "approximate_period": "Spring 2005",
        "category": "Milestone",
        "people": ["Maya", "Science Fair Judges"],
        "places": ["Lincoln Middle School Gymnasium", "Garage Workshop"],
        "tags": ["science fair", "innovation", "sister", "solar power", "youth"],
        "ai_remembrance_card": {
            "title": "Drops of Clear Water",
            "essence": "Recycled bottles, charcoal, and youthful ingenuity transforming doubt into a moment of pure triumph.",
            "key_elements": ["Handmade solar water filter", "Lincoln Middle School gym", "Blue ribbon for environmental innovation"],
            "quote_or_moment": "When clean, clear drops dripped through the beaker, she smiled so widely her braces flashed.",
            "generated_at": "2026-10-28T10:20:00Z",
            "model": "gemma3:1b",
            "is_ai_assisted": True
        },
        "ai_tribute": "Celebrating Maya's curiosity, resourcefulness, and determination to make the world cleaner and brighter through science. (AI-assisted reflection based on fictional demo story)",
        "ai_summary": "Maya wins first place at her 8th-grade science fair with a DIY solar-powered water filtration device."
    },
    {
        "id": "demo-mem-06",
        "title": "Oak Street Block Party & The Lantern Procession",
        "story": "In the final autumn before the city widened Oak Street, our entire neighborhood gathered for a twilight block party. Mr. Henderson set up his old reel-to-reel tape recorder on the sidewalk, playing jazz and motown records while children drew chalk constellations across the asphalt. As dusk fell, Mrs. Alvarez brought out paper lanterns she had taught the kids to fold from colorful tissue paper, each lit with a battery tea-candle. We marched in a merry line from house number 12 down to the cul-de-sac, our neighborhood shining like a constellation.",
        "date": "1999-09-18",
        "approximate_period": "Autumn 1999",
        "category": "Oral History",
        "people": ["Mr. Henderson", "Mrs. Alvarez"],
        "places": ["Oak Street", "The Cul-de-sac"],
        "tags": ["community", "lanterns", "block party", "autumn", "neighbors"],
        "ai_remembrance_card": {
            "title": "Constellation on Oak Street",
            "essence": "Paper lanterns, chalk stars, and the laughter of neighbors walking together in the twilight before time changed their street.",
            "key_elements": ["Reel-to-reel music on sidewalk", "Folded paper lanterns", "Twilight procession down the street"],
            "quote_or_moment": "We marched in a merry line... our neighborhood shining like a constellation.",
            "generated_at": "2026-10-28T10:25:00Z",
            "model": "gemma3:1b",
            "is_ai_assisted": True
        },
        "ai_tribute": "Remembering the beauty of community and human connection on Oak Street, where simple paper lanterns held the spirit of belonging. (AI-assisted reflection based on fictional demo story)",
        "ai_summary": "The 1999 Oak Street neighborhood twilight lantern procession celebrating togetherness and shared history."
    }
]

def load_demo_memories() -> List[Memory]:
    memories = []
    for item in FICTIONAL_DEMO_MEMORIES:
        card = None
        if "ai_remembrance_card" in item and item["ai_remembrance_card"]:
            card = RemembranceCard(**item["ai_remembrance_card"])
        memories.append(Memory(
            id=item["id"],
            title=item["title"],
            story=item["story"],
            date=item.get("date"),
            approximate_period=item.get("approximate_period"),
            category=item.get("category", "Personal"),
            people=item.get("people", []),
            places=item.get("places", []),
            tags=item.get("tags", []),
            is_fictional_demo=True,
            ai_remembrance_card=card,
            ai_tribute=item.get("ai_tribute"),
            ai_summary=item.get("ai_summary"),
            created_at=item.get("created_at", "2026-10-28T10:00:00Z"),
            updated_at=item.get("updated_at", "2026-10-28T10:00:00Z"),
        ))
    return memories

