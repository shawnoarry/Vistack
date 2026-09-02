import { describe, expect, it } from 'vitest'

import { styleTemplates } from './templates'
import { findTemplateCategoryGroup, TEMPLATE_CATEGORY_GROUPS } from './templateCategories'

describe('template category groups', () => {
    it('assigns every built-in fine category to exactly one main group', () => {
        const categories = Array.from(new Set(styleTemplates.map(template => template.category || '其他')))
        const assignments = categories.map(category => ({
            category,
            groups: TEMPLATE_CATEGORY_GROUPS.filter(group => group.categories.includes(category as never))
        }))

        expect(assignments.filter(item => item.groups.length === 0)).toEqual([])
        expect(assignments.filter(item => item.groups.length > 1)).toEqual([])
        expect(categories).toHaveLength(24)
    })

    it('keeps main group ids and labels unique', () => {
        expect(new Set(TEMPLATE_CATEGORY_GROUPS.map(group => group.id)).size).toBe(TEMPLATE_CATEGORY_GROUPS.length)
        expect(new Set(TEMPLATE_CATEGORY_GROUPS.map(group => group.label)).size).toBe(TEMPLATE_CATEGORY_GROUPS.length)
        expect(TEMPLATE_CATEGORY_GROUPS[0]?.label).toBe('游戏素材')
        expect(findTemplateCategoryGroup('精准改图配方')?.label).toBe('精准改图')
        expect(findTemplateCategoryGroup('人物设定图')?.label).toBe('游戏素材')
    })
})
