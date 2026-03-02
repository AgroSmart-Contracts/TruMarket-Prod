import React, { useState } from "react";
import Button, { ButtonVariants, ButtonSizes } from "src/components/common/button";
import Card, {
    CardVariants,
    CardPadding,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    MetricCard,
} from "src/components/common/card";
import Container from "src/components/common/container";

/**
 * Design System Showcase Page
 * 
 * This page demonstrates all the components and utilities in the TruMarket design system.
 * Use this as a reference when building new features or updating existing components.
 * 
 * Access this page at: /design-system-showcase
 */
const DesignSystemShowcase: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleLoadingDemo = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-tm-neutral py-16">
            <Container>
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-16 text-center">
                        <h1 className="tm-heading-xl tm-text-gradient-primary mb-4">
                            TruMarket Design System
                        </h1>
                        <p className="text-xl text-tm-text-light max-w-3xl mx-auto">
                            A comprehensive showcase of all components, utilities, and design patterns
                            available in the TruMarket platform.
                        </p>
                    </div>

                    {/* Color Palette Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Color Palette</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Primary Colors */}
                            <Card>
                                <CardTitle>Primary Colors</CardTitle>
                                <CardContent>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-tm-md bg-tm-primary shadow-tm-md"></div>
                                            <div>
                                                <p className="font-semibold text-tm-text">Primary</p>
                                                <p className="text-sm text-tm-text-light">#4E8C37</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-tm-md bg-tm-primary-dark shadow-tm-md"></div>
                                            <div>
                                                <p className="font-semibold text-tm-text">Primary Dark</p>
                                                <p className="text-sm text-tm-text-light">#2D8828</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Accent Colors */}
                            <Card>
                                <CardTitle>Accent Colors</CardTitle>
                                <CardContent>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-tm-md bg-tm-accent shadow-tm-md"></div>
                                            <div>
                                                <p className="font-semibold text-tm-text">Accent</p>
                                                <p className="text-sm text-tm-text-light">#F2A007</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-tm-md bg-tm-secondary shadow-tm-md"></div>
                                            <div>
                                                <p className="font-semibold text-tm-text">Secondary</p>
                                                <p className="text-sm text-tm-text-light">#F28705</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Colors */}
                            <Card>
                                <CardTitle>Status Colors</CardTitle>
                                <CardContent>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-tm-md bg-tm-danger shadow-tm-md"></div>
                                            <div>
                                                <p className="font-semibold text-tm-text">Danger</p>
                                                <p className="text-sm text-tm-text-light">#F25E6B</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-tm-md bg-tm-neutral border border-tm-text-light shadow-tm-md"></div>
                                            <div>
                                                <p className="font-semibold text-tm-text">Neutral</p>
                                                <p className="text-sm text-tm-text-light">#F2F2F2</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Buttons Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Buttons</h2>

                        <Card className="mb-8">
                            <CardTitle>Button Variants</CardTitle>
                            <CardDescription>All available button styles and variants</CardDescription>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 mt-6">
                                    <Button variant={ButtonVariants.PRIMARY}>Primary Button</Button>
                                    <Button variant={ButtonVariants.SECONDARY}>Secondary Button</Button>
                                    <Button variant={ButtonVariants.ACCENT}>Accent Button</Button>
                                    <Button variant={ButtonVariants.DANGER}>Danger Button</Button>
                                    <Button variant={ButtonVariants.OUTLINE}>Outline Button</Button>
                                    <Button variant={ButtonVariants.GHOST}>Ghost Button</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mb-8">
                            <CardTitle>Button Sizes</CardTitle>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-4 mt-6">
                                    <Button variant={ButtonVariants.PRIMARY} size={ButtonSizes.SM}>
                                        Small Button
                                    </Button>
                                    <Button variant={ButtonVariants.PRIMARY} size={ButtonSizes.MD}>
                                        Medium Button
                                    </Button>
                                    <Button variant={ButtonVariants.PRIMARY} size={ButtonSizes.LG}>
                                        Large Button
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardTitle>Button States</CardTitle>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 mt-6">
                                    <Button variant={ButtonVariants.PRIMARY}>Normal</Button>
                                    <Button variant={ButtonVariants.PRIMARY} loading={loading} onClick={handleLoadingDemo}>
                                        Loading Demo
                                    </Button>
                                    <Button variant={ButtonVariants.PRIMARY} disabled>
                                        Disabled
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Cards Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Cards</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card variant={CardVariants.DEFAULT}>
                                <CardTitle>Default Card</CardTitle>
                                <CardDescription>Standard white card with subtle shadow</CardDescription>
                                <CardContent>
                                    <p className="text-tm-text-light mt-4">
                                        This is the default card style used throughout the platform.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card variant={CardVariants.HIGHLIGHT} hover>
                                <CardTitle>Highlight Card</CardTitle>
                                <CardDescription>Card with primary border and hover effect</CardDescription>
                                <CardContent>
                                    <p className="text-tm-text-light mt-4">
                                        Use this for important or featured content.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card variant={CardVariants.ACCENT} hover>
                                <CardTitle>Accent Card</CardTitle>
                                <CardDescription>Card with gradient accent background</CardDescription>
                                <CardContent>
                                    <p className="text-tm-text-light mt-4">
                                        Perfect for call-to-action sections.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card variant={CardVariants.GRADIENT_PRIMARY}>
                                <CardTitle className="text-tm-white">Gradient Primary</CardTitle>
                                <CardDescription className="text-tm-white opacity-90">
                                    Full gradient background with primary colors
                                </CardDescription>
                                <CardContent>
                                    <p className="text-tm-white opacity-80 mt-4">
                                        Bold cards for hero sections and highlights.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card variant={CardVariants.GRADIENT_ACCENT}>
                                <CardTitle className="text-tm-white">Gradient Accent</CardTitle>
                                <CardDescription className="text-tm-white opacity-90">
                                    Full gradient background with accent colors
                                </CardDescription>
                                <CardContent>
                                    <p className="text-tm-white opacity-80 mt-4">
                                        Eye-catching cards for special offers.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card variant={CardVariants.DEFAULT} hover>
                                <CardHeader>
                                    <CardTitle>Card with Header & Footer</CardTitle>
                                    <CardDescription>Using composition components</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-tm-text-light">
                                        Cards can include headers and footers for better structure.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant={ButtonVariants.PRIMARY} size={ButtonSizes.SM}>
                                        Action
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </section>

                    {/* Metrics Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Metric Cards</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                value="$1.89M+"
                                label="Total Value"
                                trend={{ value: "12%", isPositive: true }}
                            />
                            <MetricCard
                                value="66+"
                                label="Completed Deals"
                                trend={{ value: "5%", isPositive: true }}
                            />
                            <MetricCard
                                value="24+"
                                label="Countries"
                            />
                            <MetricCard
                                value="15.2%"
                                label="Avg APY"
                                trend={{ value: "2%", isPositive: false }}
                            />
                        </div>
                    </section>

                    {/* Badges Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Badges</h2>

                        <Card>
                            <CardTitle>Badge Variants</CardTitle>
                            <CardContent>
                                <div className="flex flex-wrap gap-3 mt-6">
                                    <span className="tm-badge tm-badge-primary">Primary Badge</span>
                                    <span className="tm-badge tm-badge-accent">Accent Badge</span>
                                    <span className="tm-badge tm-badge-danger">Danger Badge</span>
                                    <span className="tm-badge tm-badge-info">Info Badge</span>
                                    <span className="tm-badge tm-badge-outline tm-text-primary">Outline Badge</span>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Gradients Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Gradients</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="tm-gradient-primary rounded-tm-lg p-8 text-center">
                                <h3 className="text-2xl font-bold text-tm-white mb-2">Primary Gradient</h3>
                                <p className="text-tm-white opacity-90">Green gradient for hero sections</p>
                            </div>
                            <div className="tm-gradient-accent rounded-tm-lg p-8 text-center">
                                <h3 className="text-2xl font-bold text-tm-white mb-2">Accent Gradient</h3>
                                <p className="text-tm-white opacity-90">Yellow/orange for highlights</p>
                            </div>
                            <div className="tm-gradient-hero rounded-tm-lg p-8 text-center">
                                <h3 className="text-2xl font-bold text-tm-white mb-2">Hero Gradient</h3>
                                <p className="text-tm-white opacity-90">Green to blue for hero sections</p>
                            </div>
                            <div className="bg-gradient-success rounded-tm-lg p-8 text-center">
                                <h3 className="text-2xl font-bold text-tm-white mb-2">Success Gradient</h3>
                                <p className="text-tm-white opacity-90">Light green for success states</p>
                            </div>
                        </div>
                    </section>

                    {/* Typography Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Typography</h2>

                        <Card>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="tm-heading-xl">Extra Large Heading</h1>
                                        <p className="text-sm text-tm-text-muted">Class: tm-heading-xl</p>
                                    </div>
                                    <div>
                                        <h2 className="tm-heading-lg">Large Heading</h2>
                                        <p className="text-sm text-tm-text-muted">Class: tm-heading-lg</p>
                                    </div>
                                    <div>
                                        <h3 className="tm-heading-md">Medium Heading</h3>
                                        <p className="text-sm text-tm-text-muted">Class: tm-heading-md</p>
                                    </div>
                                    <div>
                                        <h4 className="tm-heading-sm">Small Heading</h4>
                                        <p className="text-sm text-tm-text-muted">Class: tm-heading-sm</p>
                                    </div>
                                    <div>
                                        <p className="text-base text-tm-text">
                                            Regular body text with normal weight and size
                                        </p>
                                        <p className="text-sm text-tm-text-muted mt-2">
                                            Color: text-tm-text
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-tm-text-light">
                                            Secondary text with lighter color
                                        </p>
                                        <p className="text-sm text-tm-text-muted mt-2">
                                            Color: text-tm-text-light
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-tm-text-muted">
                                            Muted text for less important information
                                        </p>
                                        <p className="text-sm text-tm-text-muted mt-2">
                                            Color: text-tm-text-muted
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Progress Bars Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Progress Bars</h2>

                        <Card>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-tm-text">Primary Progress</span>
                                            <span className="text-sm font-medium text-tm-primary">75%</span>
                                        </div>
                                        <div className="tm-progress">
                                            <div className="tm-progress-fill" style={{ width: "75%" }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-tm-text">Accent Progress</span>
                                            <span className="text-sm font-medium text-tm-accent">50%</span>
                                        </div>
                                        <div className="tm-progress tm-progress-accent">
                                            <div className="tm-progress-fill" style={{ width: "50%" }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-tm-text">Complete</span>
                                            <span className="text-sm font-medium text-tm-primary">100%</span>
                                        </div>
                                        <div className="tm-progress">
                                            <div className="tm-progress-fill" style={{ width: "100%" }}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Timeline Section */}
                    <section className="mb-16">
                        <h2 className="tm-heading-lg mb-8">Timeline</h2>

                        <Card>
                            <CardContent>
                                <div className="space-y-0">
                                    <div className="tm-timeline-item tm-timeline-item-completed">
                                        <h4 className="font-semibold text-tm-text mb-1">Deal Created</h4>
                                        <p className="text-sm text-tm-text-light">January 15, 2025</p>
                                    </div>
                                    <div className="tm-timeline-item tm-timeline-item-completed">
                                        <h4 className="font-semibold text-tm-text mb-1">Funding Complete</h4>
                                        <p className="text-sm text-tm-text-light">January 20, 2025</p>
                                    </div>
                                    <div className="tm-timeline-item tm-timeline-item-active">
                                        <h4 className="font-semibold text-tm-text mb-1">In Transit</h4>
                                        <p className="text-sm text-tm-text-light">Current stage</p>
                                    </div>
                                    <div className="tm-timeline-item tm-timeline-item-pending">
                                        <h4 className="font-semibold text-tm-text mb-1">Delivery Expected</h4>
                                        <p className="text-sm text-tm-text-light">February 10, 2025</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Footer */}
                    <Card variant={CardVariants.GRADIENT_PRIMARY} className="text-center">
                        <CardContent>
                            <h3 className="text-2xl font-bold text-tm-white mb-3">
                                Ready to Build?
                            </h3>
                            <p className="text-tm-white opacity-90 mb-6 max-w-2xl mx-auto">
                                Use these components and utilities to create consistent,
                                beautiful interfaces across the TruMarket platform.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button variant={ButtonVariants.ACCENT} size={ButtonSizes.LG}>
                                    Read Documentation
                                </Button>
                                <Button variant={ButtonVariants.SECONDARY} size={ButtonSizes.LG}>
                                    View Source Code
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default DesignSystemShowcase;

