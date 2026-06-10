import classNames from "classnames";
import React, { HTMLAttributes, ReactNode, FC } from "react";

export enum CardVariants {
    DEFAULT = "default",
    HIGHLIGHT = "highlight",
    ACCENT = "accent",
    GRADIENT_PRIMARY = "gradient_primary",
    GRADIENT_ACCENT = "gradient_accent",
}

export enum CardPadding {
    NONE = "none",
    SM = "sm",
    MD = "md",
    LG = "lg",
    XL = "xl",
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: CardVariants;
    padding?: CardPadding;
    hover?: boolean;
    className?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

const Card: FC<CardProps> = ({
    children,
    variant = CardVariants.DEFAULT,
    padding = CardPadding.MD,
    hover = false,
    className,
    header,
    footer,
    ...rest
}) => {
    const variantStyles = {
        default: "bg-tm-white border border-[#E5E7EB] shadow-tm-sm",
        highlight: "bg-tm-white border-2 border-tm-primary shadow-[0_4px_12px_rgba(60,166,56,0.15)]",
        accent: "bg-gradient-to-br from-[rgba(242,160,7,0.1)] to-[rgba(242,135,5,0.1)] border border-tm-accent",
        gradient_primary: "tm-gradient-primary text-tm-white border-0 shadow-tm-primary",
        gradient_accent: "tm-gradient-accent text-tm-white border-0 shadow-[0_4px_14px_0_rgba(242,160,7,0.25)]",
    };

    const paddingStyles = {
        none: "",
        sm: "p-3",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
    };

    const hoverStyles = hover
        ? "transition-all duration-300 ease-out hover:shadow-tm-lg hover:-translate-y-1 cursor-pointer"
        : "";

    return (
        <div
            className={classNames(
                "rounded-tm-lg",
                variantStyles[variant],
                paddingStyles[padding],
                hoverStyles,
                className,
            )}
            {...rest}
        >
            {header && (
                <div className="mb-4 pb-4 border-b border-current border-opacity-10">
                    {header}
                </div>
            )}

            <div>{children}</div>

            {footer && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-10">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;

// Additional Card sub-components for better composition
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <div className={classNames("mb-4 pb-4 border-b border-[#E5E7EB]", className)}>
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <h3 className={classNames("text-xl font-semibold text-tm-text", className)}>
        {children}
    </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <p className={classNames("text-sm text-tm-text-light mt-2", className)}>
        {children}
    </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => <div className={className}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <div className={classNames("mt-4 pt-4 border-t border-[#E5E7EB]", className)}>
        {children}
    </div>
);

// Metric Card Component
interface MetricCardProps {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    value,
    label,
    icon,
    trend,
    className,
}) => (
    <Card
        variant={CardVariants.DEFAULT}
        hover
        className={classNames("text-center", className)}
    >
        {icon && (
            <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-tm-primary-transparent flex items-center justify-center text-tm-primary">
                    {icon}
                </div>
            </div>
        )}
        <div className="tm-metric-value">{value}</div>
        <div className="tm-metric-label">{label}</div>
        {trend && (
            <div
                className={classNames(
                    "text-sm font-semibold mt-2",
                    trend.isPositive ? "text-tm-primary" : "text-tm-danger",
                )}
            >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
            </div>
        )}
    </Card>
);

