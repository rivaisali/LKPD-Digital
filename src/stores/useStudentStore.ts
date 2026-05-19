import { defineStore } from 'pinia'
import { ref } from 'vue'
import { saveStudent, getStudent, clearStudent } from '@/db/db'

export const useStudentStore = defineStore('student', () => {
  const name = ref('Nita')
  const className = ref('')
  const isOnboarded = ref(false)

  async function loadFromDB() {
    const record = await getStudent()
    if (record) {
      name.value = record.name
      className.value = record.className
      isOnboarded.value = true
    }
  }

  async function save(studentName: string, studentClass: string) {
    name.value = studentName
    className.value = studentClass
    isOnboarded.value = true
    await saveStudent({
      name: studentName,
      className: studentClass,
      createdAt: new Date().toISOString(),
    })
  }

  async function reset() {
    name.value = ''
    className.value = ''
    isOnboarded.value = false
    await clearStudent()
  }

  return { name, className, isOnboarded, loadFromDB, save, reset }
})
