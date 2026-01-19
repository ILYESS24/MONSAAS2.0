import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter Plan",
    description: "For small teams or first-time AI users",
    price: { monthly: 179, annual: 143 },
    features: [
      "AI Application Plan (PDF)",
      "Implementation of 1 AI Automation",
      "Post-Setup Checklist",
      "Email Support for 14 Days"
    ],
    cta: "Get Starter Plan",
    popular: false
  },
  {
    name: "Growth Plan",
    description: "For companies ready to automate multiple workflows",
    price: { monthly: 799, annual: 639 },
    features: [
      "Full Workflow Analysis",
      "Roadmap with 3+ AI Recommendations",
      "Implementation of up to 3 Automations",
      "Staff Onboarding Materials",
      "Priority Support for 30 Days"
    ],
    cta: "Get Growth Plan",
    popular: true
  },
  {
    name: "Custom Enterprise Plan",
    description: "For teams with 50+ employees or advanced needs",
    price: { monthly: 6990, annual: 5592 },
    features: [
      "Full AI Strategy",
      "Technical Implementation",
      "Maintenance & Optimization",
      "Dedicated Manager",
      "24/7 Support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="min-h-screen w-full bg-black relative py-20 px-6 md:px-12 overflow-hidden">
      {/* Geometric grid - subtle dots */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
            style={{ left: `${16.66 * (i + 1)}%` }}
          />
        ))}
        {/* Cross markers */}
        {[1, 2, 3, 4, 5].map((col) =>
          [1, 2, 3].map((row) => (
            <div
              key={`dot-${col}-${row}`}
              className="absolute"
              style={{
                left: `${16.66 * col}%`,
                top: `${25 * row}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              <span className="block w-1 h-1 bg-white/30 rounded-full" />
            </div>
          ))
        )}
        {/* Small decorative dots */}
        <div className="absolute top-20 right-1/4 w-1.5 h-1.5 bg-white/30" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-white/30" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="font-display font-black text-6xl md:text-7xl lg:text-9xl text-white tracking-[-0.02em] mb-6"
          >
            PRICING.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="font-body text-white/60 text-lg max-w-md mx-auto"
          >
            You only pay for what you need —
            <br />
            after we show you the plan.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <span
              className={`font-body text-sm uppercase tracking-wider transition-colors ${
                !isAnnual ? "text-white" : "text-white/40"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-white/20 rounded-full transition-colors"
            >
              <motion.div
                animate={{ x: isAnnual ? 28 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full"
              />
            </button>
            <span
              className={`font-body text-sm uppercase tracking-wider transition-colors ${
                isAnnual ? "text-white" : "text-white/40"
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 border border-white/20 text-white text-xs font-body px-2 py-1 rounded-full"
              >
                Save 20%
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true, amount: 0.2 }}
              className={`relative p-8 lg:p-10 ${
                plan.popular
                  ? "bg-white/5 border border-white/10 lg:-my-4 lg:py-14"
                  : "border-l border-white/10 first:border-l-0"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="bg-white text-black text-xs font-body font-medium px-4 py-1 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                </motion.div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2 flex items-center gap-3">
                  {plan.name}
                  {plan.popular && (
                    <span className="text-xs font-body font-normal text-white/50 uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </h3>
                <p className="font-body text-xs uppercase tracking-[0.15em] text-white/40">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <motion.div
                  key={isAnnual ? "annual" : "monthly"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-white">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="font-body text-white/40 text-sm">/month</span>
                </motion.div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1 + i * 0.05,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                    <span className="font-body text-xs uppercase tracking-[0.1em] text-white/60">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 font-body text-sm uppercase tracking-wider font-medium transition-all ${
                  plan.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
