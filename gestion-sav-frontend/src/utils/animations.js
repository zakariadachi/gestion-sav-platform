export const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] } })
};
