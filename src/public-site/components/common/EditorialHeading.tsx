import React from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react'; // 1. Imported Variants type

interface EditorialHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'giant';
  className?: string;
  italicWord?: string;
  theme?: 'dark' | 'light';
  animate?: boolean;
}

// 2. Applied Variants type here
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

// 3. Applied Variants type here to fix the "number[]" ease curve error
const childVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 1.2, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

const wrapWithStagger = (node: React.ReactNode, keyPrefix = ''): React.ReactNode => {
  if (typeof node === 'string') {
    return node.split(/(\s+)/).map((word, i) => {
      if (word.trim() === '') {
        return word;
      }
      return (
        <motion.span
          key={`${keyPrefix}-${i}`}
          variants={childVariants}
          className="inline-block"
        >
          {word}
        </motion.span>
      );
    });
  }

  if (React.isValidElement(node)) {
    if (node.type === 'br') return node;
    const children = (node.props as any).children;
    if (children) {
      return React.cloneElement(
        node as React.ReactElement, 
        {}, 
        React.Children.map(children, (child, i) => wrapWithStagger(child, `${keyPrefix}-el-${i}`))
      );
    }
    return (
      <motion.span key={keyPrefix} variants={childVariants} className="inline-block">
        {node}
      </motion.span>
    );
  }

  if (Array.isArray(node)) {
    return React.Children.map(node, (child, i) => wrapWithStagger(child, `${keyPrefix}-arr-${i}`));
  }

  return node;
};

export const EditorialHeading: React.FC<EditorialHeadingProps> = ({
  children,
  as: Component = 'h2',
  size = 'lg',
  className = '',
  theme = 'dark',
  animate = true,
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl md:text-4xl tracking-tight leading-[1.15]',
    md: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.08]',
    lg: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-[-0.025em] leading-[0.98]',
    xl: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-[-0.03em] leading-[0.94]',
    giant: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10.5rem] tracking-[-0.035em] leading-[0.9]',
  };

  const textColor = theme === 'light' ? 'text-[#FEFFFF]' : 'text-[#0E1721]';
  const staggeredChildren = animate ? wrapWithStagger(children, 'heading') : children;

  const headingContent = (
    <Component
      className={`font-gemola font-light ${sizeClasses[size]} ${textColor} ${className}`}
      style={{
        fontFamily: "'Cormorant Garamond', 'Italiana', Georgia, serif",
      }}
    >
      {staggeredChildren}
    </Component>
  );

  if (!animate) return headingContent;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      {headingContent}
    </motion.div>
  );
};