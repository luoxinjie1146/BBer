import { NS } from "@ns"
import { ServerName } from "/lib/servers";

/**
 * 如果相应的攻击程序存在，则攻击对应的端口，然后尝试 NUKE。
 * @param ns 
 * @param host - Hostname of the target server.
 * @returns - True if the player runs the program successfully, and false otherwise.
 */
export default async function root ( ns: NS, host: ServerName ): Promise<boolean>
{
	if ( ns.fileExists( "BruteSSH.exe", "home" ) )
	{
		await ns.brutessh( host );
	}
	if ( ns.fileExists( "FTPCrack.exe", "home" ) )
	{
		await ns.ftpcrack( host );
	}
	if ( ns.fileExists( "relaySMTP.exe", "home" ) )
	{
		await ns.relaysmtp( host );
	}
	if ( ns.fileExists( "HTTPWorm.exe", "home" ) )
	{
		await ns.httpworm( host );
	}
	if ( ns.fileExists( "SQLInject.exe", "home" ) )
	{
		await ns.sqlinject( host );
	}
	return await ns.nuke( host );
}