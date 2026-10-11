import { motion } from "framer-motion";
import { Bot, Code, TestTube, Server, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  gradient: string;
}

const services: Service[] = [
  {
    icon: Code,
    title: "Automation Suite",
    description: "Transform manual tasks into automated workflows",
    features: ["Process automation", "API integrations", "Workflow builders"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Bot,
    title: "AI Chatbots",
    description: "Intelligent conversational interfaces for your business",
    features: ["24/7 support", "Natural language", "Custom training"],
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Server,
    title: "DevOps Setup",
    description: "Infrastructure and deployment automation",
    features: ["CI/CD pipelines", "Cloud deployment", "Monitoring"],
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: TestTube,
    title: "Testing Suite",
    description: "Comprehensive testing and quality assurance",
    features: ["API testing", "Load testing", "Test automation"],
    gradient: "from-cyan-500 to-teal-600",
  },
];

export const ServiceCards = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            End-to-end solutions for modern development teams
          </p>
        </motion.div>

        {/* Service cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold flex items-center justify-between">
                      {service.title}
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
