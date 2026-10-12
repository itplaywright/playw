import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { auth } from "@/lib/auth"

function flattenObject(ob: any, prefix = '') {
    return Object.keys(ob).reduce((acc: any, k) => {
        const pre = prefix.length ? prefix + '.' : ''
        if (typeof ob[k] === 'object' && ob[k] !== null && !Array.isArray(ob[k])) {
            Object.assign(acc, flattenObject(ob[k], pre + k))
        } else {
            acc[pre + k] = ob[k]
        }
        return acc
    }, {})
}

export async function GET(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const locale = searchParams.get("locale") || "uk"
    
    try {
        const filePath = path.join(process.cwd(), 'messages', `${locale}.json`)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const jsonData = JSON.parse(fileContent)
        
        const flatData = flattenObject(jsonData)
        return NextResponse.json(flatData)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
