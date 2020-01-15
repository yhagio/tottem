import { useEffect, useState } from 'react'
import {
    useGetCollectionProfileQuery,
    GetCollectionProfileQuery,
} from '../../../generated/types'
import Loading from '../../UtilsPage/Loading'
import DividerIcon from '../../../../public/pictograms/divider.svg'
import FilterBadgesView from '../../Me/components/FilterBadgesView'
import ItemCard from './components/ItemCard'
import { ItemType } from '../../common'
import { useApolloClient } from '@apollo/react-hooks'
import Link from 'next/link'

export interface ICollectionProps {
    authUserId?: string
    collectionId: string
    profileSlug: string
}

const useBreadcrumbs = (profileSlug: string) => {
    const client = useApolloClient()

    const setBreadcrumbs = ({ collection }: GetCollectionProfileQuery) => {
        const section = collection?.section
        const breadcrumbs = [
            {
                title: `@${profileSlug}`,
                as: `/${profileSlug}`,
                href: '/[profile]',
                __typename: 'Breadcrumb',
            },
            {
                title: section?.name || 'New Section',
                as: `/${profileSlug}/${section?.slug}`,
                href: '/[profile]/[sectionSlug]',
                __typename: 'Breadcrumb',
            },
            {
                title: collection?.title || 'New Collection',
                as: `/${profileSlug}/c/${collection?.slug}`,
                href: '/[profile]/c/[collectionSlug]',
                __typename: 'Breadcrumb',
            },
        ]
        client.writeData({
            data: {
                breadcrumbs,
            },
        })
    }

    const resetBreadcrumbs = () => {
        client.writeData({
            data: {
                breadcrumbs: [],
            },
        })
    }

    return { resetBreadcrumbs, setBreadcrumbs }
}

export default function Collection({
    authUserId,
    collectionId,
    profileSlug,
}: ICollectionProps) {
    const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([])
    const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs(profileSlug)
    const { data, loading } = useGetCollectionProfileQuery({
        variables: {
            collectionId,
        },
        onCompleted: setBreadcrumbs,
    })

    useEffect(() => {
        return () => {
            resetBreadcrumbs()
        }
    }, [collectionId])

    if (loading || !data?.collection) {
        return <Loading />
    }

    const { collection } = data

    const updatedAt = new Date(collection.updatedAt).toLocaleDateString(
        'fr-FR',
        {
            year: 'numeric',
            day: 'numeric',
            month: 'short',
        }
    )

    const filteredItems = collection.items
        ?.filter(x => !x.isDeleted)
        ?.filter(i => {
            return !selectedTypes.length || selectedTypes.includes(i.type)
        })
        ?.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        ?.sort((a, b) => a.position - b.position)

    return (
        <div className="flex flex-col max-w-3xl mx-auto">
            <div className="text-2xl text-gray-900">
                {collection.title || 'New Collection'}
            </div>
            {collection.detail && (
                <div className="mt-8 text-gray-700 leading-relaxed text-base font-light">
                    {collection.detail}
                </div>
            )}
            <div className="flex mt-8 items-center">
                <img
                    className="h-12 w-12 rounded-full"
                    src={collection.owner.pictureUrl}
                    alt="Author avatar"
                />
                <div className="ml-4 leading-none">
                    <Link as={`/${collection.owner.slug}`} href="/[profile]">
                        <a className="text-gray-900 py-1">
                            {collection.owner.firstname}
                        </a>
                    </Link>
                    <div className="text-gray-500 text-sm tracking-tight py-1">
                        {updatedAt}
                    </div>
                </div>
                <DividerIcon className="fill-current text-gray-400 h-8 ml-6" />
                <FilterBadgesView
                    className="ml-6"
                    listId={collection.id}
                    onFilterChange={setSelectedTypes}
                    items={collection.items}
                />
            </div>
            <div className="mt-10">
                {filteredItems.map(item => {
                    return (
                        <ItemCard
                            className="mt-6 first:mt-0"
                            item={item}
                            key={item.id}
                        />
                    )
                })}
            </div>
        </div>
    )
}