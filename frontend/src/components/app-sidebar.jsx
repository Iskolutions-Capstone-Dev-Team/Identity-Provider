import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Users,
  ShieldUser,
  MonitorCog,
  FileCheckCorner,
  Activity,
  FileSearchCorner,
  CircleHelp,
  LogOut,
  FileText
} from "lucide-react"

import { useLocation, useNavigate, Link } from "react-router-dom"
import { usePermissionAccess } from "../providers/PermissionProvider"
import { buildLogoutPath } from "../auth/utils/logoutRoute"
import { handleOnePortalClick } from "./OnePortalButton"
import { APP_CLIENT_PAGE_PERMISSIONS, PERMISSIONS, REGISTRATION_PAGE_PERMISSIONS, USER_POOL_PAGE_PERMISSIONS } from "../routes/routePermissions"

const menuSections = [
  {
    title: "Dashboard",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        requiredPermissions: [],
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Identity Management",
    items: [
      {
        name: "User Pool",
        path: "/user-pool",
        requiredPermissions: USER_POOL_PAGE_PERMISSIONS,
        icon: Users,
      },
      {
        name: "Roles",
        path: "/roles",
        requiredPermissions: [PERMISSIONS.VIEW_ROLES],
        icon: ShieldUser,
      },
      {
        name: "App Client",
        path: "/app-client",
        requiredPermissions: APP_CLIENT_PAGE_PERMISSIONS,
        icon: MonitorCog,
      },
      {
        name: "Registration",
        path: "/registration",
        requiredPermissions: REGISTRATION_PAGE_PERMISSIONS,
        icon: FileCheckCorner,
      },
    ],
  },
  {
    title: "Activity",
    items: [
      {
        name: "Audit Logs",
        path: "/audit-logs",
        requiredPermissions: [PERMISSIONS.VIEW_AUDIT_LOGS],
        icon: FileSearchCorner,
      },
      {
        name: "FAQ",
        path: "/faq",
        requiredPermissions: [],
        icon: CircleHelp,
      },
    ],
  },
  {
    title: "API Reference",
    items: [
      {
        name: "Documentation",
        path: "http://localhost:8080/swagger/external/index.html",
        isExternal: true,
        requiredPermissions: [],
        icon: FileText,
      },
    ],
  },
]

export function AppSidebar({ currentUser }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasAnyPermission, isLoadingPermissions } = usePermissionAccess()

  const handleLogout = () => {
    navigate(
      buildLogoutPath({
        userId: currentUser?.id,
      }),
      { replace: true },
    )
  }

  const visibleMenuSections = isLoadingPermissions
    ? []
    : menuSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            hasAnyPermission(item.requiredPermissions),
          ),
        }))
        .filter((section) => section.items.length > 0)

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex flex-row items-center px-4 group-data-[collapsible=icon]:px-2 transition-all duration-200 ease-linear overflow-hidden">
        <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="h-8 w-8 object-contain shrink-0" />
        <span className="ml-2 text-lg font-bold tracking-tight whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 truncate">
          Identity Provider
        </span>
      </SidebarHeader>
      <SidebarContent>
        {visibleMenuSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        isActive={isActive} 
                        tooltip={item.name}
                        render={
                          item.isExternal ? (
                            <a href={item.path} target="_blank" rel="noopener noreferrer" />
                          ) : (
                            <Link to={item.path} />
                          )
                        }
                        className="gap-3"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleOnePortalClick} className="flex items-center gap-3 cursor-pointer" tooltip="One Portal">
              <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain"/>
              <span className="truncate transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">One Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 cursor-pointer" tooltip="Logout">
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
