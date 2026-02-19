import { motion, AnimatePresence } from 'framer-motion'

export function GuidanceCharacter() {
  return (
    <AnimatePresence>
      <motion.div
        className="relative md:fixed md:top-1/2 md:-translate-y-1/2 md:right-8 z-30 flex flex-col items-center md:items-end pointer-events-none mb-6 md:mb-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* 对话气泡 */}
        <motion.div
          className="bg-white/90 text-gray-800 p-3 md:p-4 rounded-2xl shadow-neon mb-2 max-w-[280px] md:max-w-xs relative backdrop-blur-sm border border-neon-gold/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <p className="text-[10px] md:text-xs leading-relaxed font-bold">
            请注意个人信息保护，请勿输入他/她的个人信息以及奇奇怪怪的数据），请妥善注意您的使用！
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
