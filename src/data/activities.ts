import type { ActivityConfig } from '@/domain/types'

export const activities: ActivityConfig[] = [
  {
    id: 'translation',
    label: 'Translasi',
    sublabel: 'Pergeseran',
    color: '#ec6585',
    bgColor: '#ec658520',
    textColor: '#ffffff',
    icon: 'arrow_forward',
    route: '/activity/translation',
  },
  {
    id: 'reflection',
    label: 'Refleksi',
    sublabel: 'Pencerminan',
    color: '#f79624',
    bgColor: '#f7962420',
    textColor: '#ffffff',
    icon: 'flip',
    route: '/activity/reflection',
  },
  {
    id: 'rotation',
    label: 'Rotasi',
    sublabel: 'Perputaran',
    color: '#3d91cf',
    bgColor: '#3d91cf20',
    textColor: '#ffffff',
    icon: 'refresh',
    route: '/activity/rotation',
  },
  {
    id: 'dilation',
    label: 'Dilatasi',
    sublabel: 'Perbesaran',
    color: '#43a669',
    bgColor: '#43a66920',
    textColor: '#ffffff',
    icon: 'open_in_full',
    route: '/activity/dilation',
  },
]
