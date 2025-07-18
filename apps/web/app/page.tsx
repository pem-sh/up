import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Section,
  Text,
} from '@radix-ui/themes'
import {
  Activity,
  AlertCircle,
  GitBranch,
  Globe,
  Shield,
  Zap,
} from 'lucide-react'

export default async function Home() {
  return (
    <>
      {/* Navigation */}
      <Box asChild>
        <nav className="border-b border-gray-200">
          <Container size="4">
            <Flex align="center" justify="between" py="4">
              <Heading size="6" weight="bold">
                Up
              </Heading>
              <Flex gap="6" align="center">
                <Link href="/login" color="gray" highContrast>
                  Sign in
                </Link>
                <Button variant="solid" color="gray" highContrast asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </Flex>
            </Flex>
          </Container>
        </nav>
      </Box>

      {/* Hero Section */}
      <Section size="4" className="py-24 md:py-32">
        <Container size="4">
          <Flex direction="column" align="center" gap="6">
            <Heading
              size="9"
              weight="bold"
              align="center"
              className="max-w-4xl tracking-tight"
            >
              Uptime monitoring that just works
            </Heading>
            <Text size="5" color="gray" align="center" className="max-w-2xl">
              Monitor your websites, APIs, and services with comprehensive DNS,
              TLS, and domain checks. Fully open source.
            </Text>
            <Flex gap="4" mt="4">
              <Button
                size="4"
                variant="solid"
                color="gray"
                highContrast
                asChild
              >
                <Link href="/register">Start Monitoring</Link>
              </Button>
              <Button
                size="4"
                variant="outline"
                color="gray"
                highContrast
                asChild
              >
                <Link href="https://github.com/pem-sh/up" target="_blank">
                  <GitBranch className="w-4 h-4" />
                  View on GitHub
                </Link>
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Section>

      {/* Features Grid */}
      <Section size="4" className="py-16 bg-gray-50">
        <Container size="4">
          <Grid columns={{ initial: '1', md: '3' }} gap="8">
            <Flex direction="column" gap="3">
              <Box className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </Box>
              <Heading size="4" weight="bold">
                Instant Alerts
              </Heading>
              <Text color="gray" size="3">
                Get notified immediately when your website becomes unavailable.
                Multiple notification channels supported.
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              <Box className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </Box>
              <Heading size="4" weight="bold">
                Comprehensive Checks
              </Heading>
              <Text color="gray" size="3">
                Built-in DNS, TLS certificate, and domain expiration monitoring.
                Never miss a renewal again.
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              <Box className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-white" />
              </Box>
              <Heading size="4" weight="bold">
                Fully Open Source
              </Heading>
              <Text color="gray" size="3">
                Self-host with confidence. Inspect the code, contribute
                features, and maintain full control of your data.
              </Text>
            </Flex>
          </Grid>
        </Container>
      </Section>

      {/* Detailed Features */}
      <Section size="4" className="py-24">
        <Container size="4">
          <Flex direction="column" gap="9">
            <Flex direction="column" align="center" gap="3">
              <Heading size="7" weight="bold" align="center">
                Everything you need for reliable monitoring
              </Heading>
              <Text size="4" color="gray" align="center" className="max-w-2xl">
                Up provides comprehensive monitoring capabilities with a focus
                on simplicity and reliability.
              </Text>
            </Flex>

            <Grid columns={{ initial: '1', md: '2' }} gap="8" className="mt-8">
              <Flex gap="4">
                <Activity className="w-6 h-6 mt-1 flex-shrink-0" />
                <Flex direction="column" gap="2">
                  <Heading size="3" weight="bold">
                    Multi-region monitoring
                  </Heading>
                  <Text color="gray" size="2">
                    Check your services from multiple geographic locations to
                    ensure global availability.
                  </Text>
                </Flex>
              </Flex>

              <Flex gap="4">
                <Zap className="w-6 h-6 mt-1 flex-shrink-0" />
                <Flex direction="column" gap="2">
                  <Heading size="3" weight="bold">
                    1-minute intervals
                  </Heading>
                  <Text color="gray" size="2">
                    High-frequency monitoring ensures you know about issues
                    before your users do.
                  </Text>
                </Flex>
              </Flex>

              <Flex gap="4">
                <Globe className="w-6 h-6 mt-1 flex-shrink-0" />
                <Flex direction="column" gap="2">
                  <Heading size="3" weight="bold">
                    HTTP & TCP monitoring
                  </Heading>
                  <Text color="gray" size="2">
                    Monitor websites, APIs, databases, and any TCP service with
                    customizable checks.
                  </Text>
                </Flex>
              </Flex>

              <Flex gap="4">
                <Shield className="w-6 h-6 mt-1 flex-shrink-0" />
                <Flex direction="column" gap="2">
                  <Heading size="3" weight="bold">
                    SSL/TLS monitoring
                  </Heading>
                  <Text color="gray" size="2">
                    Track certificate expiration dates and get alerts before
                    they expire.
                  </Text>
                </Flex>
              </Flex>
            </Grid>
          </Flex>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section size="4" className="py-24 bg-black text-white">
        <Container size="4">
          <Flex direction="column" align="center" gap="6">
            <Heading
              size="8"
              weight="bold"
              align="center"
              className="text-white"
            >
              Start monitoring in seconds
            </Heading>
            <Text size="4" align="center" className="max-w-2xl text-gray-300">
              Join thousands of developers who trust Up for their uptime
              monitoring needs.
            </Text>
            <Button
              size="4"
              variant="solid"
              className="bg-white text-black hover:bg-gray-100"
              asChild
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          </Flex>
        </Container>
      </Section>

      {/* Footer */}
      <Box asChild>
        <footer className="border-t border-gray-200 py-8">
          <Container size="4">
            <Flex justify="between" align="center">
              <Text size="2" color="gray">
                © 2025 Up by Ethan Mick LLC. All rights reserved.
              </Text>
              <Flex gap="6">
                <Link href="https://github.com/pem-sh/up" color="gray" size="2">
                  GitHub
                </Link>
                <Link href="/docs" color="gray" size="2">
                  Documentation
                </Link>
                <Link href="/api" color="gray" size="2">
                  API
                </Link>
              </Flex>
            </Flex>
          </Container>
        </footer>
      </Box>
    </>
  )
}
