import { describe, expect, it } from 'vitest'

import { styleTemplates } from './templates'
import {
    filterAndRankTemplates,
    getTemplateTaxonomy,
    TEMPLATE_OUTPUT_OPTIONS,
    TEMPLATE_SCENE_OPTIONS,
    TEMPLATE_STYLE_OPTIONS,
    TEMPLATE_TASK_OPTIONS
} from './templateTaxonomy'

const emptyFilters = { output: '', style: '', scene: '', task: '' } as const

describe('template taxonomy', () => {
    it('classifies every built-in template with canonical facet values', () => {
        const outputs = new Set(TEMPLATE_OUTPUT_OPTIONS.map(option => option.value))
        const styles = new Set(TEMPLATE_STYLE_OPTIONS.map(option => option.value))
        const scenes = new Set(TEMPLATE_SCENE_OPTIONS.map(option => option.value))
        const tasks = new Set(TEMPLATE_TASK_OPTIONS.map(option => option.value))

        for (const template of styleTemplates) {
            const taxonomy = getTemplateTaxonomy(template)
            expect(outputs.has(taxonomy.output)).toBe(true)
            expect(taxonomy.styles.every(value => styles.has(value))).toBe(true)
            expect(taxonomy.scenes.every(value => scenes.has(value))).toBe(true)
            expect(taxonomy.tasks.every(value => tasks.has(value))).toBe(true)
        }
    })

    it('ranks canonical types and bilingual aliases ahead of prompt-only matches', () => {
        expect(filterAndRankTemplates(styleTemplates, '白皮书', emptyFilters)[0]?.id).toBe('awesome-document-publishing')
        expect(filterAndRankTemplates(styleTemplates, 'manual', emptyFilters)[0]?.id).toBe('awesome-document-publishing')
        expect(filterAndRankTemplates(styleTemplates, '品牌系统', emptyFilters)[0]?.id).toBe('awesome-brand-identity-package')
    })

    it('combines structured filters across dimensions', () => {
        const results = filterAndRankTemplates(styleTemplates, '', {
            output: 'infographic',
            style: 'infographic',
            scene: 'education',
            task: 'layout'
        })

        expect(results.map(template => template.id)).toEqual(expect.arrayContaining([
            'awesome-infographic-engine',
            'awesome-scientific-scale-diagram'
        ]))
        expect(results.every(template => getTemplateTaxonomy(template).output === 'infographic')).toBe(true)
    })

    it('keeps explicit UI categories ahead of incidental chart keywords', () => {
        const budgetApp = styleTemplates.find(template => template.id === 'gallery-mobile-budgeting-app')
        const operationsDashboard = styleTemplates.find(template => template.id === 'gallery-desktop-operations-dashboard')

        expect(budgetApp && getTemplateTaxonomy(budgetApp).output).toBe('ui')
        expect(operationsDashboard && getTemplateTaxonomy(operationsDashboard).output).toBe('ui')
    })
})
