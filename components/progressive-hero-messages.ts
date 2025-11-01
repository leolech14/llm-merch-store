/**
 * Progressive Hero Messages - Educational & Fun
 *
 * Different messages for each visit showing system cleverness,
 * product updates, experiment performance, and jokes
 *
 * Educational focus: Show how the system works while entertaining
 */

export interface ProgressiveMessage {
  visit: number;
  title: string;
  subtitle: string;
  insight?: string; // Educational explanation
  cta: string;
  variant: "wtf" | "cognitive" | "skate" | "minimal";
}

export const PROGRESSIVE_MESSAGES: ProgressiveMessage[] = [
  // VISIT 1: WTF? What is this?
  {
    visit: 1,
    variant: "wtf",
    title: "WTF?",
    subtitle: "Yeah, we tracked this is your first time. Cool visual shit on t-shirts to make knowledge travel. That's it.",
    insight: "🧠 We're using device fingerprinting (screen + timezone + UA) to count visits. No cookies, no tracking pixels. Privacy-first!",
    cta: "Bora ver essa parada",
  },

  // VISIT 2: You're back! Stats update
  {
    visit: 2,
    variant: "cognitive",
    title: "Hey! You came back!",
    subtitle: "572 people checked this out. 89 added to cart. 0 sales yet (it's experimental). Wanna see what's hot?",
    insight: "🔥 Fun fact: 'Fresh Models' tee has 234 likes. The double entendre is working. People get it.",
    cta: "Show me the data",
  },

  // VISIT 3: System cleverness
  {
    visit: 3,
    variant: "skate",
    title: "3rd visit. Nice.",
    subtitle: "This is your 3rd time here. The system knows. We're testing 4 different hero variants to see which converts better. You're seeing the Skate version now.",
    insight: "🧪 Educational: Hero changes based on visit count (1=WTF, 2=Cognitive, 3=Skate, 4+=Minimal). It's called Progressive Disclosure in UX design.",
    cta: "Show me how it works",
  },

  // VISIT 4: Performance update
  {
    visit: 4,
    variant: "minimal",
    title: "You're a regular now.",
    subtitle: "4 visits = you're interested. Current experiment status: 1,290 pageviews, 842 likes, still 0 sales (launch pending). Countdown: 2 days.",
    insight: "📊 A/B Testing Result: Hero WTF is converting at 45% (best). This Minimal version you're seeing now? Only 25%. But you're already engaged, so less fluff needed.",
    cta: "Just show me the tees",
  },

  // VISIT 5: Joke + honesty
  {
    visit: 5,
    variant: "minimal",
    title: "5 visits and no purchase?",
    subtitle: "Look, we get it. You're just here to see if the system is actually smart or if we're full of shit. Spoiler: it's both. But the tees are real.",
    insight: "😂 Truth: This whole 'Cognitive Wearables' thing started as a joke. Then we realized—wait, it actually works. Knowledge DOES travel better on fabric than pixels.",
    cta: "Fine, I'll look",
  },

  // VISIT 6: Product update
  {
    visit: 6,
    variant: "wtf",
    title: "Product update!",
    subtitle: "New data: 'Transformer Architecture' is the most clicked (67 times). 'LLM Brunette' is trending. Still only 1 of each available. First come, first serve.",
    insight: "🎯 Why 1 of each? Because in a world of mass production, scarcity creates value. Plus, being THE ONLY person with that design? That's the real flex.",
    cta: "Show me what's trending",
  },

  // VISIT 7: Collector spotlight
  {
    visit: 7,
    variant: "cognitive",
    title: "Collector spotlight!",
    subtitle: "If this launches, 'IronTensor' wants the Transformer tee. 'MistralGirl' called dibs on Fresh Models. The P2P market is forming BEFORE launch. That's wild.",
    insight: "💰 Educational: We built a P2P marketplace where collectors can resell. One tee already has a R$200 offer (34% appreciation). It's like NFTs but you can actually wear them.",
    cta: "Join the waitlist",
  },

  // VISIT 8: System insight
  {
    visit: 8,
    variant: "skate",
    title: "You're basically stalking us now.",
    subtitle: "8 visits. The system logged everything: which products you clicked, how long you stayed, if you liked anything. All in an event-store with full audit trail.",
    insight: "🔍 Educational: Event Sourcing means every action is an immutable log entry. We can replay the entire history, see what worked, what didn't. Time-travel debugging.",
    cta: "Show me my profile",
  },

  // VISIT 9+: Meta joke
  {
    visit: 9,
    variant: "minimal",
    title: "Still here?",
    subtitle: "At this point you either work here or you're genuinely curious how deep this rabbit hole goes. Spoiler: It goes deep. We have 12 APIs, event sourcing, device fingerprinting, and now you're reading generated copy that adapts to your visit count.",
    insight: "🤖 Meta: This message itself is proof the system works. It knew this is your 9th visit and served contextual copy. That's the magic—tech that feels like it knows you.",
    cta: "OK I'm impressed",
  },
];

/**
 * Get message for visit count
 */
export function getMessageForVisit(visitCount: number): ProgressiveMessage {
  if (visitCount <= 0) visitCount = 1;

  // Use specific message if exists
  const specificMessage = PROGRESSIVE_MESSAGES.find(m => m.visit === visitCount);
  if (specificMessage) return specificMessage;

  // For visits 10+, cycle through jokes
  const jokes = PROGRESSIVE_MESSAGES.filter(m => m.visit >= 5);
  const index = (visitCount - 10) % jokes.length;
  return jokes[index] || PROGRESSIVE_MESSAGES[PROGRESSIVE_MESSAGES.length - 1];
}

/**
 * Get recommended hero variant (with A/B testing engine integration)
 */
export async function getOptimalHeroVariant(visitCount: number): Promise<string> {
  try {
    // Fetch A/B testing results
    const res = await fetch('/api/admin/hero-config');
    const config = await res.json();

    // If A/B testing enabled and we have winner
    if (config.winner && config.winner !== 'Testing...') {
      return config.winner.toLowerCase();
    }

    // Fallback to progressive logic
    const message = getMessageForVisit(visitCount);
    return message.variant;
  } catch {
    // Fallback to visit-based
    const message = getMessageForVisit(visitCount);
    return message.variant;
  }
}
