import GlobalSearch from "./GlobalSearch";

function PageHeader({ title, subtitle, children }) {
    return (
        <div className="dashboard-header">
            <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>

            <GlobalSearch />

            {children && <div className="page-header-extra">{children}</div>}
        </div>
    );
}

export default PageHeader;