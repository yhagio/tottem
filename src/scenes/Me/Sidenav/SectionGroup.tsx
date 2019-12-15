import spaceIcon from '@iconify/icons-ic/baseline-layers'
import arrowIcon from '@iconify/icons-ic/round-keyboard-arrow-right'
import { InlineIcon } from '@iconify/react'
import { useUpdateSectionExpandedMutation } from '../../../generated/types'
import Link from 'next/link'
import { MouseEvent } from 'react'

interface SectionGroupProps {
    title: string
    id: string
    currentHref: string
    isExpanded: boolean
    isActive: boolean
    collections: Array<{ title: string; id: string }>
}

export default ({
    title,
    id,
    isExpanded,
    currentHref,
    collections,
}: SectionGroupProps) => {
    const bgBrand200 = `bg-brand-100`

    const [setExpanded] = useUpdateSectionExpandedMutation()

    const handleExpand = (e: MouseEvent) => {
        setExpanded({
            variables: { isExpanded: !isExpanded, sectionId: id },
            optimisticResponse: {
                updateOneSection: {
                    id,
                    isExpanded: !isExpanded,
                    __typename: 'Section',
                },
            },
        })
        e.preventDefault()
    }
    const sectionHref = `/me/s/${id}`
    return (
        <div>
            <Link href="/me/s/[sectionId]" as={sectionHref}>
                <a
                    className={`flex justify-between items-center pl-2 py-1 mb-1 rounded hover:${bgBrand200} cursor-pointer font-semibold ${currentHref ===
                        sectionHref && bgBrand200}`}
                >
                    <div>
                        <span className="mr-1">
                            <InlineIcon
                                className="inline"
                                color="#BFBFBF"
                                icon={spaceIcon}
                            />
                        </span>
                        <span className="text-gray-800">{title}</span>
                    </div>
                    <div
                        onClick={handleExpand}
                        className="px-2 text-gray-600 hover:text-gray-800"
                    >
                        <InlineIcon
                            width={16}
                            height={16}
                            className={`inline transition-all ${
                                isExpanded ? 'rotate-90deg' : 'rotate-0deg'
                            }`}
                            icon={arrowIcon}
                        />
                    </div>
                </a>
            </Link>

            {isExpanded &&
                collections.map(collection => {
                    const collectionHref = `/me/c/${collection.id}`
                    return (
                        <Link
                            key={collection.id}
                            href="/me/c/[collectionId]"
                            as={collectionHref}
                        >
                            <a
                                className={`block px-6 py-1 rounded hover:${bgBrand200} cursor-pointer whitespace-no-wrap truncate mb-1 font-normal ${currentHref ===
                                    collectionHref && bgBrand200}`}
                            >
                                {collection.title}
                            </a>
                        </Link>
                    )
                })}
        </div>
    )
}