import { NS } from "@ns"
import { ServerName } from "/lib/servers";

/** @param {NS} ns */
export async function main ( ns: NS, host: ServerName )
{
	while ( true )
	{
		await ns.hack( host );
	}
}