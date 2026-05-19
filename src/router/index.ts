import { createRouter, createWebHistory } from 'vue-router'
import { useStudentStore } from '@/stores/useStudentStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'splash', component: () => import('@/pages/SplashPage.vue') },
    { path: '/home', name: 'home', component: () => import('@/pages/HomePage.vue') },
    { path: '/story', name: 'story', component: () => import('@/pages/StoryPage.vue') },
    { path: '/guide', name: 'guide', component: () => import('@/pages/GuidePage.vue') },
    { path: '/activity/translation', name: 'translation', component: () => import('@/pages/TranslationPage.vue') },
    { path: '/activity/reflection', name: 'reflection', component: () => import('@/pages/ReflectionPage.vue') },
    { path: '/activity/rotation', name: 'rotation', component: () => import('@/pages/RotationPage.vue') },
    { path: '/activity/dilation', name: 'dilation', component: () => import('@/pages/DilationPage.vue') },
    { path: '/challenge', name: 'challenge', component: () => import('@/pages/ChallengePage.vue') },
    { path: '/result', name: 'result', component: () => import('@/pages/ResultPage.vue') },
    { path: '/reflection', name: 'student-reflection', component: () => import('@/pages/StudentReflectionPage.vue') },
    { path: '/profile', name: 'profile', component: () => import('@/pages/ProfilePage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Arahkan ke splash jika belum onboarding
router.beforeEach((to) => {
  if (to.name === 'splash' || to.name === 'guide') return true
  const studentStore = useStudentStore()
  if (!studentStore.isOnboarded) return { name: 'splash' }
  return true
})

export default router
