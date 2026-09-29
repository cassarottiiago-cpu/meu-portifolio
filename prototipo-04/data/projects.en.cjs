// English version of the case texts (same keys as projects.cjs). Images, links and order come from projects.cjs.
// Same rules as the Portuguese source: no invented dates, conversion metrics or user-research claims.
module.exports = {
  autopost: {
    kind: 'Digital product', status: 'Internal platform in production',
    alt: 'AUTOPOST: monthly publishing calendar, the day’s schedule and the scheduling chat',
    line: 'One post. The right destination for every location.', scope: 'Concept, UI/UX and full-stack development',
    heading: 'Distribute without losing control.',
    context: ['AUTOPOST was built for an operation with dozens of brands and more than 80 client locations. The same campaign had to reach the right Instagram and Facebook accounts without depending on an error-prone manual routine.', 'The team writes the request in Portuguese, attaches the media, checks the destinations and confirms. The platform interprets the schedule, applies each location’s technical sign-off and follows the post all the way to publication.'],
    decisions: [
      ['Human confirmation', 'The agent interprets dates, times, networks and locations, but never posts on its own. The final list of destinations stays visible before confirmation.'],
      ['Isolated operators', 'Row Level Security in PostgreSQL separates each operator’s data inside the database itself. Publishing destinations are tied to the location’s record, and isolation does not rely on front-end validation alone.'],
      ['A queue that never duplicates', 'The queue checks the network before resending, monitors failures and expired connections, and offers a retry without duplicating the post in the feed.']
    ],
    development: ['The interface uses React, TypeScript, Vite and plain CSS, with a weight budget enforced at build time. An AI agent chat, a drag-and-drop calendar and the publishing queue are part of the same workflow.', 'The Meta Graph API publishes Reels, images and carousels to Instagram and Facebook. Each network gets its own caption, with the WhatsApp link where it is clickable. For clinics, the technical lead and professional registration come from the location’s record. Warnings about pricing, promises of results and before-and-after images support the human review of health content.', 'The back end uses Node.js, Express, TypeScript and PostgreSQL with Row Level Security. Meta credentials are encrypted with AES-256-GCM and never return to the screen. The queue tracks failures, delays and connections about to expire, allows retries and bulk deletion of posts. Scheduling uses Brasília time, regardless of the server’s time zone.', 'The infrastructure runs on Oracle Cloud with Ubuntu, Caddy with HTTPS, systemd and daily backups. Around 800 Vitest tests cover units, integrations and isolation between clients against a real database.', 'My role spanned the whole product: concept, interface and experience design, full-stack development, database, integrations and production deployment.'],
    detailCaption: 'Location registry: operator, brand, technical lead and professional registration tied to each destination.',
    extraCaption: 'Publishing queue for Instagram and Facebook, with monitoring and the scheduling chat.'
  },
  phron: {
    kind: 'Digital product', status: 'Personal project in development',
    mobileCaption: 'PHRON test on WhatsApp: conversation, a voice message and a reply with available times. Capture provided by Iago.',
    alt: 'PHRON in dark mode: Home with news, trackers and personal assistant',
    line: 'I’m building a space that connects routine, information and assistance.',
    scope: 'Interface, experience and product development',
    heading: 'A product in the making. A routine as the starting point.',
    context: ['PHRON is my personal project in development. The idea is to bring work, study and personal life together in a space where information and assistance can be consulted side by side.', 'I’m developing the experience and the implementation in parallel. The Home shown here is the current stage of the interface: side navigation, widgets and assistant on a single screen. It is a snapshot of the process, not a finished product yet.'],
    decisions: [
      ['Recognizable contexts', 'The side navigation keeps the available paths in view while the workspace content changes. Users don’t need to go back to a home screen to find their way.'],
      ['Editable routine', 'Widgets organize the central space. The layout treats the workspace as something that can be adjusted, not as a single fixed dashboard.'],
      ['Assistant alongside', 'The assistant has its own column. The conversation and the main content can coexist on the same screen, keeping the context of what is being done.']
    ],
    development: ['I develop PHRON locally with Next.js and React. The build is organized into three areas: navigation, workspace and assistance. This split lets the interface and the flows of each part evolve over the course of the project.', 'The images record the development stage of September 27, 2026: the Home in dark mode and a conversation test over WhatsApp.', 'In the test, the conversation includes a voice message and a reply with available times. It is a one-off demonstration of the integration in progress; the remaining flows and capabilities still need to be finished and validated.'],
    detailCaption: 'PHRON Home in dark mode, with news, trackers and assistant. Capture provided by Iago.'
  },
  qozt: {
    kind: 'Landing page', status: 'Live site',
    alt: 'QOZT page with the sales pitch, an intelligent-agents interface and access to the demo',
    line: 'Conversation becomes connection.', scope: 'Page design and development',
    heading: 'Making an intangible service visible.',
    context: ['Intelligent sales agents are not a product anyone can hold. The page has to give the proposition an understandable shape before asking visitors to take the next step.', 'The opening brings the sales message close to a representation of the interface. The invitation to see the solution appears next to what is being presented, without depending on reading the whole page.'],
    decisions: [
      ['Pitch and demo', 'Message, product visual and the call to a demo make up the first screen. The hierarchy ties what the solution offers to the available action.'],
      ['Interface as evidence', 'The product representation has real presence in the composition. It gives a concrete point of reading to a proposition that, on its own, would be abstract.'],
      ['One next step', 'The sales path leads to the demo. The page works as a guided presentation, not as the agents’ operating interface.']
    ],
    development: ['The scope shown is QOZT’s public website. The page organizes sales content, the visual presentation of the product and entry points to the demo in a single sequence.', 'The split between headlines, explanatory blocks and calls to action lets visitors skim or go through the content in depth. That structure is the focus of this case; the commercial software shown inside the page is not credited as part of this delivery.', 'The capture was taken at the public address. Numbers and claims that appear in it belong to the site’s communication and are not proven conversion metrics of this portfolio.'],
    detailCaption: 'Mobile app section on the public QOZT website. The work shown is the landing page, not the software presented inside it.'
  },
  natalia: {
    kind: 'Website and interface', status: 'Live site',
    alt: 'Dra. Natália Messias website: typography, illustration and content on child neurodevelopment',
    line: 'Care translated into visual language.', scope: 'Interface design and website development',
    heading: 'A welcoming gaze.',
    context: ['A children’s care website welcomes families with questions, not just visitors looking for a specialty. The presentation needs to make room to understand the professional and her approach to care.', 'The visual language combines typography, illustration and a soft palette. These elements belong to this work’s identity; each project in the portfolio calls for its own language.'],
    decisions: [
      ['Visual warmth', 'The illustrations and light tones match the subject of the care. The composition sets up a less impersonal visual entry into the content.'],
      ['Layered reading', 'Headlines, explanations and practical information carry different weights. Visitors can find a topic before committing to a block of reading.'],
      ['The doctor’s presence', 'Presenting the physician gives context to the service. Content and visual language work together to show who is behind the care.']
    ],
    development: ['The site is a web build with HTML, CSS and JavaScript, bundled with Vite. The layout is built in sections, with responsive rules that reorganize text and images according to the available width.', 'Typography and illustration have to work as part of the content, including on small screens. Development follows that hierarchy, preserving reading and navigation paths without depending on a single desktop composition.', 'The case presents the published interface, not clinical results or an assessment of family satisfaction.'],
    detailCaption: 'Dra. Natália’s introduction section, captured in full.'
  },
  'dr-paulo': {
    kind: 'Website and interface', status: 'Live site',
    alt: 'Dr. Paulo Rogério Seraphim’s website presenting his mental health practice',
    line: 'Not everything that tightens the chest has a name yet.', scope: 'Website interface and development',
    heading: 'A first conversation, not a rushed prescription.',
    context: ['The current version presents Dr. Paulo Rogério Seraphim Júnior as a mental health physician for adults in Londrina. The entry starts from recognizable symptoms and situations before talking about training, method and care.', 'The site organizes the experience as a numbered sequence: home, reasons to seek care, about the doctor, care, readings and contact. The navigation works as a permanent index of the journey.'],
    decisions: [
      ['Permanent index', 'Numbering and section labels keep the journey legible. People can see where they are before deciding to continue.'],
      ['Reasons to seek care', 'The section turns symptoms and situations into entry points. The content helps people recognize a need without forcing a diagnosis through the interface.'],
      ['The appointment explained', 'First appointment, a written plan and follow-up appear as steps. The care is described before booking.']
    ],
    development: ['The observed published version uses a long page with section navigation and direct contact points. The content alternates editorial blocks, numbered cards and care steps.', 'The interface prioritizes typography, spacing and reading order. Reasons to seek care, training, method, readings and contact each have a distinct role, so the first screen doesn’t carry every decision.', 'The capture was taken on the live site, drpauloseraphim.com.br. The case describes the observed interface and does not turn medical information, testimonials or claims on the site into proven results of this portfolio.'],
    detailCaption: 'Dr. Paulo’s care section: first appointment, written plan and follow-up.'
  },
  limozine: {
    kind: 'Landing page', status: 'Live site',
    fullCaption: 'Full page composed from real captures of the visible sections, to preserve the animated content.',
    alt: 'Limozine: photographic opening of the steakhouse, with the full logo',
    line: 'An experience that starts before the table.', scope: 'Landing page design and development',
    heading: 'Selling the night before the booking.',
    context: ['Limozine needed to present more than a menu. History, the rodízio service, reviews, prices and booking are all part of the decision to visit the steakhouse.', 'The page uses a strong photographic opening and an editorial sequence to build desire, then shorten the distance to the practical action.'],
    decisions: [
      ['Atmosphere first', 'The video opening puts the restaurant experience ahead of the details. The brand appears inside a setting, not isolated in an institutional block.'],
      ['History as proof', 'Limozine’s origin and the path through menu, prices and reviews give weight to the promise before the booking request.'],
      ['Booking without detours', 'Delivery, WhatsApp and the booking form appear along the way. Each action has context and an identifiable next step.']
    ],
    development: ['The landing page organizes a long narrative into sections with their own navigation: the story, the menu, prices, reviews and booking.', 'The booking path appears in the header and along the page. The build keeps the action visible and routes the request to the restaurant’s channel, without simulating a checkout inside the case.', 'The work shown is the page and its information architecture. Testimonials, prices and claims on the site belong to the restaurant’s communication; they are not metrics attributed to this portfolio.'],
    detailCaption: 'Limozine’s menu gallery, captured after the photos loaded.'
  },
  dominos: {
    kind: 'Link in bio', status: 'Live site · Chácara Flora, SP',
    alt: 'Domino’s Chácara Flora: page with iFood, the official website, social networks and deals',
    line: 'From pizza craving to the next tap.', scope: 'Link page design and development',
    heading: 'The order starts with choosing the path.',
    context: ['The page gathers the links of Domino’s Chácara Flora under a single address. Visitors coming from social media find the way to order, the official website and the store’s channels.', 'The blue and red identity organizes the entry. iFood gets the red highlight; the other channels follow. After the links, a deals area presents the pizzas and their ordering paths.'],
    decisions: [
      ['Ordering first', 'The iFood link opens the list and gets the strongest color. The action is obvious before exploring the other channels.'],
      ['One specific store', 'The name, location and social profiles of Chácara Flora identify the local operation within the Domino’s brand.'],
      ['Deals with a destination', 'Image, description and ordering options sit close together in the deals area. Each promotion points to the channel where the purchase continues.']
    ],
    development: ['The layout uses a column of links followed by deals. On mobile, the links take the reading width and the photo stays in the background; on desktop, the content is concentrated in the center.', 'The buttons combine an icon, the channel name and an action cue. iFood, the official website and social networks have their own destinations, without introducing a checkout on the link page.', 'The deals bring together images, descriptions and calls to order. The scope of this work is this Chácara Flora store page, with the brand’s identity and content applied to the interface.'],
    detailCaption: 'Deals and ordering paths of Domino’s Chácara Flora.'
  },
  'bmk-blink': {
    kind: 'Link in bio', status: 'Live site',
    alt: 'BMK’s Blink with BMK.AI, the NËXXO presentation and service links',
    line: 'One entry point to the whole BMK ecosystem.', scope: 'Link page design and development',
    heading: 'Concentrate without flattening the offer.',
    context: ['BMK’s Blink brings initiatives, channels and services together in a single entry point. Its content goes beyond social networks: it includes access to BMK.AI, the NËXXO presentation and service options.', 'The interface challenge is to give these destinations an order without treating them all as equal. The opening highlights BMK.AI, followed by a visual presentation of NËXXO and the other paths.'],
    decisions: [
      ['Explicit priority', 'Access to BMK.AI gets its own contrast. The difference in treatment signals a choice of hierarchy among the destinations.'],
      ['An offer shown, not told', 'The NËXXO presentation uses a visual sequence instead of relying only on a long description.'],
      ['Comparable services', 'Service tiers appear as separate options. The organization makes the alternatives easy to find within a compact page.']
    ],
    development: ['The build combines shortcuts, carousels and a service presentation in a central column. Direct navigation and content exploration coexist, with controls to move back and forth through the sequences.', 'The development of this page organizes access to products and services. The presence of NËXXO and BMK.AI in the captures does not mean full authorship of those platforms.', 'The public address was inspected without submitting forms or messages. This case describes the observed interface, without presenting commercial results as if they had been measured.'],
    detailCaption: 'Plans and services carousel of Blink BMK, after its images and fonts loaded.'
  },
  odonto: {
    kind: 'Landing page', status: 'Live site · Nanuque, Brazil',
    alt: 'Melhem Odontologia: dark opening with delicate lines, introduction and appointment links',
    line: 'Precision in form. Clarity in the next step.', scope: 'Landing page design and development',
    heading: 'A digital presence that reflects the clinic.',
    context: ['Melhem Odontologia presents its aesthetic dentistry and oral rehabilitation practice in Nanuque, Brazil. The site introduces treatments, planning, facilities and the clinical team before inviting visitors to book.', 'The visual direction combines a dark background, sand tones and fine lines in the opening. Numbered sections guide the reading and give each subject its own space.'],
    decisions: [
      ['Identity and rhythm', 'Large typography, contrast and delicate lines introduce the clinic. Numbered sections support reading throughout the page.'],
      ['Treatments in context', 'Procedures, planning stages and the team have their own sections. Visitors can get to know the clinic before making contact.'],
      ['Two ways to get in touch', 'WhatsApp and a form offer alternative ways to start a conversation. Location and practical details sit near the booking options.']
    ],
    development: ['The page combines anchor navigation, treatments, planning, facilities and team introductions. Visual hierarchy organizes the content into a continuous sequence.', 'Contact can begin through WhatsApp or a form with name, phone and procedure of interest. This case presents the published interface without attributing commercial or clinical outcomes to the page.'],
    detailCaption: 'Melhem Odontologia procedures: specialties and contact links.'
  }
};
