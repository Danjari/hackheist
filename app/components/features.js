import { ShieldCheckIcon, EyeIcon, MapIcon, MicrophoneIcon, BellAlertIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Real-Time Monitoring',
    description:
      "Check in anytime. With real-time updates, you’ll know where your loved one is and what’s around them.",
    icon: ShieldCheckIcon,
  },
  {
    name: 'Live Camera Feed',
    description:
      "No extra sensors needed—just a built-in AI camera that helps them navigate confidently.",
    icon: EyeIcon,
  },
  {
    name: 'Proximity Alerts',
    description:
      "If something is too close, AYN warns them immediately, reducing risks and ensuring safety.",
    icon: BellAlertIcon,
  },
  {
    name: 'Voice Interaction',
    description:
      "Your loved one can receive spoken descriptions of their surroundings, making navigation seamless.",
    icon: MicrophoneIcon,
  },
  {
    name: 'Maps & Navigation',
    description:
      "AYN integrates with Google Maps and Street View, providing smarter navigation assistance.",
    icon: MapIcon,
  },
]

export default function Features() {
  return (
    <div>
      {/* Background Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ffffff30] to-[#ffffff10] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-lg font-semibold text-indigo-400">Our Features</h2>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Freedom for them. Peace of mind for you.
          </p>
          <p className="mt-6 text-lg text-gray-300">
            Ayn gives your loved one the freedom to navigate safely, while giving you the peace of mind
            of knowing their location, environment, and safety status in real time.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-semibold text-white flex items-center">
                  <div className="absolute top-0 left-0 flex size-12 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30">
                    <feature.icon className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base text-gray-300">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}