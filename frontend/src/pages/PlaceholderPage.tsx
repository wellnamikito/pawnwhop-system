export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <section>
            <h1>{title}</h1>
            <p className="page-description">Этот раздел будет добавлен на следующем этапе.</p>
        </section>
    );
}